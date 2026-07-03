export type EventStatus = "pendente" | "aprovado" | "rejeitado" | "cancelado" | "terminado";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          avatar_url: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; email: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & { name: string; slug: string };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
      };
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          location_name: string;
          address: string | null;
          event_date: string;
          end_date: string | null;
          start_time: string;
          end_time: string | null;
          poster_url: string | null;
          description: string | null;
          category_id: string;
          created_by: string;
          status: EventStatus;
          is_featured: boolean;
          rejection_reason: string | null;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> & {
          title: string;
          location_name: string;
          event_date: string;
          start_time: string;
          category_id: string;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
      };
      event_gallery: {
        Row: {
          id: string;
          event_id: string;
          image_url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["event_gallery"]["Row"]> & {
          event_id: string;
          image_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["event_gallery"]["Row"]>;
      };
      suggestions: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          message: string;
          created_at: string;
          is_read: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["suggestions"]["Row"]> & { message: string };
        Update: Partial<Database["public"]["Tables"]["suggestions"]["Row"]>;
      };
      site_settings: {
        Row: {
          key: string;
          value: string | null;
          updated_at: string;
        };
        Insert: { key: string; value?: string | null };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type EventGalleryRow = Database["public"]["Tables"]["event_gallery"]["Row"];
export type Suggestion = Database["public"]["Tables"]["suggestions"]["Row"];

export interface EventWithRelations extends EventRow {
  category: Category;
  creator?: Pick<Profile, "id" | "full_name" | "avatar_url">;
  gallery?: EventGalleryRow[];
}
