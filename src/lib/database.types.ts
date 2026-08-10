export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      components: {
        Row: {
          id: string;
          name: string;
          category: string;
          sub_tags: string[];
          quantity: number;
          unit: string;
          low_stock_threshold: number;
          datasheet_url: string | null;
          image_urls: string[];
          notes: string | null;
          added_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string;
          sub_tags?: string[];
          quantity?: number;
          unit?: string;
          low_stock_threshold?: number;
          datasheet_url?: string | null;
          image_urls?: string[];
          notes?: string | null;
          added_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          sub_tags?: string[];
          quantity?: number;
          unit?: string;
          low_stock_threshold?: number;
          datasheet_url?: string | null;
          image_urls?: string[];
          notes?: string | null;
          added_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "components_added_by_fkey";
            columns: ["added_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      stock_logs: {
        Row: {
          id: string;
          component_id: string;
          user_id: string | null;
          change_type: 'add' | 'remove' | 'use' | 'restock' | 'adjust';
          quantity_delta: number;
          project_tag: string | null;
          notes: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          component_id: string;
          user_id?: string | null;
          change_type: 'add' | 'remove' | 'use' | 'restock' | 'adjust';
          quantity_delta: number;
          project_tag?: string | null;
          notes?: string | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          component_id?: string;
          user_id?: string | null;
          change_type?: 'add' | 'remove' | 'use' | 'restock' | 'adjust';
          quantity_delta?: number;
          project_tag?: string | null;
          notes?: string | null;
          timestamp?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stock_logs_component_id_fkey";
            columns: ["component_id"];
            isOneToOne: false;
            referencedRelation: "components";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_quantity: {
        Args: {
          p_component_id: string;
          p_delta: number;
          p_user_id: string;
          p_change_type?: string;
          p_project_tag?: string | null;
          p_notes?: string | null;
        };
        Returns: Database['public']['Tables']['components']['Row'];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
