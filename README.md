# Calendário de Eventos — Vila Nova de Poiares

Aplicação web para consulta e submissão de eventos dos Bombeiros Voluntários de Vila Nova de Poiares.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase (PostgreSQL, Auth, Storage) · Vercel

Preparado para funcionar inteiramente nos planos gratuitos do Supabase e da Vercel.

---

## 1. Estrutura do projeto

```
src/
  app/                 páginas (App Router)
  components/          componentes React (UI + domínio)
  components/ui/       componentes base estilo shadcn/ui
  lib/                 clientes Supabase, funções de acesso a dados, utilitários
  types/               tipos TypeScript da base de dados
supabase/
  migrations/          scripts SQL completos (schema, funções, RLS, storage)
public/
  branding/            imagem de fallback do emblema dos Bombeiros Voluntários
```

---

## 2. Criar o projeto no Supabase

1. Crie uma conta em [supabase.com](https://supabase.com) e um novo projeto (plano gratuito).
2. Em **Project Settings → API**, copie o `Project URL` e a chave `anon public`.
3. Em **SQL Editor**, execute os scripts da pasta `supabase/migrations/` **por ordem**:
   1. `0001_schema.sql` — tabelas, tipos, índices, categorias iniciais
   2. `0002_functions_triggers.sql` — funções auxiliares e triggers
   3. `0003_rls_policies.sql` — Row Level Security completo
   4. `0004_storage.sql` — buckets de Storage e políticas

   Cole o conteúdo de cada ficheiro no SQL Editor e execute um de cada vez.

4. Em **Authentication → Providers**, confirme que o método **Email** está ativo.
   Para testes rápidos, pode desativar "Confirm email" em **Authentication → Settings**.
5. Em **Authentication → URL Configuration**, defina o **Site URL** para o domínio da aplicação
   (ex: `https://calendario.bvvilanovadepoiares.pt`) e adicione o mesmo domínio (e
   `http://localhost:3000` durante o desenvolvimento) em **Redirect URLs**.

### Definir o primeiro administrador

Não existe interface para promover administradores — é uma ação manual e intencional.
Depois de o primeiro utilizador se registar na aplicação, execute no **SQL Editor**:

```sql
update public.profiles set is_admin = true where email = 'email-do-admin@exemplo.pt';
```

### Fecho automático de eventos passados (opcional)

A função `public.mark_events_finished()` marca eventos como "terminado" quando a data já
passou. Pode agendá-la diariamente com a extensão **pg_cron** (disponível no plano gratuito):

```sql
create extension if not exists pg_cron;
select cron.schedule('mark-events-finished', '0 3 * * *', 'select public.mark_events_finished()');
```

### Carregar o logótipo oficial

O logótipo pode ser trocado sem alterar código, através da tabela `site_settings` e do bucket
`logos` no Storage:

1. Em **Storage → logos**, carregue o ficheiro do emblema dos Bombeiros Voluntários.
2. Copie a URL pública do ficheiro.
3. No **SQL Editor**:
   ```sql
   update public.site_settings set value = 'URL_PUBLICA_DO_LOGOTIPO' where key = 'logo_url';
   ```

Até isso ser feito, a aplicação usa automaticamente a imagem local em
`public/branding/logo-fallback.png` (o emblema oficial já incluído no projeto).

---

## 3. Configurar variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 4. Correr localmente

```bash
npm install
npm run dev
```

Aceda a [http://localhost:3000](http://localhost:3000).

---

## 5. Publicar no GitHub

```bash
git init
git add .
git commit -m "Calendário de Eventos - Vila Nova de Poiares"
git branch -M main
git remote add origin <url-do-seu-repositorio>
git push -u origin main
```

---

## 6. Deploy na Vercel

1. Em [vercel.com](https://vercel.com), importe o repositório GitHub (plano gratuito/Hobby).
2. Em **Environment Variables**, adicione as três variáveis do `.env.local`
   (com `NEXT_PUBLIC_SITE_URL` a apontar para o domínio final).
3. Clique em **Deploy**.
4. Após o primeiro deploy, atualize também em **Authentication → URL Configuration** no
   Supabase o Site URL e Redirect URLs para o domínio definitivo da Vercel.

Não é necessária nenhuma alteração de código adicional — a aplicação está pronta a funcionar.

---

## 7. Modelo de dados (resumo)

| Tabela          | Descrição                                                |
|------------------|-----------------------------------------------------------|
| `profiles`        | Perfis públicos dos utilizadores (espelha `auth.users`)     |
| `categories`       | Categorias de eventos                                        |
| `events`           | Eventos submetidos                                            |
| `event_gallery`     | Imagens adicionais de cada evento                             |
| `suggestions`       | Sugestões enviadas na página Melhorias                        |
| `site_settings`     | Configurações editáveis (ex: URL do logótipo)                  |

Toda a segurança é garantida por **Row Level Security** no PostgreSQL — nunca apenas no
frontend. Consulte `supabase/migrations/0003_rls_policies.sql` para o detalhe de cada política.

### Regra de negócio importante

Sempre que um utilizador (não administrador) edita um evento já **aprovado**, um trigger
(`events_reset_status_on_edit`) repõe automaticamente o estado para **pendente**, exigindo nova
aprovação. Administradores estão isentos desta regra.

---

## 8. Buckets de Storage

| Bucket          | Conteúdo                       | Acesso                                     |
|------------------|-----------------------------------|-----------------------------------------------|
| `logos`           | Logótipo dos Bombeiros Voluntários   | Leitura pública · escrita apenas admin          |
| `event-images`     | Cartaz principal dos eventos         | Leitura pública · escrita pelo autor/admin      |
| `gallery`          | Galeria adicional dos eventos         | Leitura pública · escrita pelo autor/admin      |
| `avatars`          | Fotografias de perfil                 | Leitura pública · escrita pelo próprio          |

---

## 9. Notas finais

- O projeto usa **Server Components** por omissão, com **Client Components** apenas onde há
  interatividade (formulários, calendário, menus).
- A pesquisa de texto livre usa índices `pg_trgm` no PostgreSQL para bom desempenho.
- Os slugs dos eventos são gerados automaticamente e são únicos.
- Todos os formulários validam dados no cliente (Zod), mas a integridade é sempre garantida
  também no servidor através de constraints SQL e políticas RLS.
