"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShieldCheck, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export function UserMenu({ profile }: { profile: Profile }) {
  const router = useRouter();
  const initials = profile.full_name
    ? profile.full_name.slice(0, 2).toUpperCase()
    : profile.email.slice(0, 2).toUpperCase();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus-visible:ring-2 focus-visible:ring-ring outline-none">
        <Avatar>
          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{profile.full_name || profile.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/painel">
            <LayoutDashboard className="h-4 w-4" /> O meu painel
          </Link>
        </DropdownMenuItem>
        {profile.is_admin && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <ShieldCheck className="h-4 w-4" /> Administração
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="h-4 w-4" /> Terminar sessão
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
