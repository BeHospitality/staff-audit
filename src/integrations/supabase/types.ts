export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      dossier_actions: {
        Row: {
          action_type: string
          created_at: string
          dossier_id: string
          id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          dossier_id: string
          id?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          dossier_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dossier_actions_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "pulse_dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          biggest_challenge: string | null
          created_at: string
          dossier_pin: string | null
          dossier_url: string | null
          email: string
          full_name: string
          id: string
          phone: string
          property_name: string
          report_sent_at: string | null
          role: string | null
          staff_count: number | null
          status: string
          turnover_rate: number | null
          updated_at: string
          vibe_check_code: string | null
          vibe_check_requested: boolean | null
          vibe_check_responses: number | null
          vibe_check_total_staff: number | null
        }
        Insert: {
          biggest_challenge?: string | null
          created_at?: string
          dossier_pin?: string | null
          dossier_url?: string | null
          email: string
          full_name: string
          id?: string
          phone: string
          property_name: string
          report_sent_at?: string | null
          role?: string | null
          staff_count?: number | null
          status?: string
          turnover_rate?: number | null
          updated_at?: string
          vibe_check_code?: string | null
          vibe_check_requested?: boolean | null
          vibe_check_responses?: number | null
          vibe_check_total_staff?: number | null
        }
        Update: {
          biggest_challenge?: string | null
          created_at?: string
          dossier_pin?: string | null
          dossier_url?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string
          property_name?: string
          report_sent_at?: string | null
          role?: string | null
          staff_count?: number | null
          status?: string
          turnover_rate?: number | null
          updated_at?: string
          vibe_check_code?: string | null
          vibe_check_requested?: boolean | null
          vibe_check_responses?: number | null
          vibe_check_total_staff?: number | null
        }
        Relationships: []
      }
      managers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          organization_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          organization_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "managers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          industry: string | null
          internal_notes: string | null
          manager_email: string | null
          org_code: string
          org_name: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          industry?: string | null
          internal_notes?: string | null
          manager_email?: string | null
          org_code: string
          org_name: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string | null
          internal_notes?: string | null
          manager_email?: string | null
          org_code?: string
          org_name?: string
          status?: string
        }
        Relationships: []
      }
      pulse_dossiers: {
        Row: {
          client_response: string | null
          created_at: string
          first_viewed_at: string | null
          id: string
          last_viewed_at: string | null
          organization_id: string
          pin_code: string
          status: string
          unique_code: string
          view_count: number
        }
        Insert: {
          client_response?: string | null
          created_at?: string
          first_viewed_at?: string | null
          id?: string
          last_viewed_at?: string | null
          organization_id: string
          pin_code: string
          status?: string
          unique_code: string
          view_count?: number
        }
        Update: {
          client_response?: string | null
          created_at?: string
          first_viewed_at?: string | null
          id?: string
          last_viewed_at?: string | null
          organization_id?: string
          pin_code?: string
          status?: string
          unique_code?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "pulse_dossiers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_responses: {
        Row: {
          department: string | null
          id: string
          is_demo_data: boolean
          open_feedback: string | null
          organization_id: string
          question_1_energy: number
          question_2_support: number
          question_3_growth: number
          question_4_spirit: number | null
          submitted_at: string
        }
        Insert: {
          department?: string | null
          id?: string
          is_demo_data?: boolean
          open_feedback?: string | null
          organization_id: string
          question_1_energy: number
          question_2_support: number
          question_3_growth: number
          question_4_spirit?: number | null
          submitted_at?: string
        }
        Update: {
          department?: string | null
          id?: string
          is_demo_data?: boolean
          open_feedback?: string | null
          organization_id?: string
          question_1_energy?: number
          question_2_support?: number
          question_3_growth?: number
          question_4_spirit?: number | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pulse_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vibe_check_responses: {
        Row: {
          anonymous_id: string
          created_at: string
          department: string
          employment_type: string
          id: string
          lead_id: string | null
          q1_score: number
          q2_score: number
          q3_score: number
          q4_score: number
          q5_score: number
          role_level: string
          tenure: string
        }
        Insert: {
          anonymous_id: string
          created_at?: string
          department: string
          employment_type: string
          id?: string
          lead_id?: string | null
          q1_score: number
          q2_score: number
          q3_score: number
          q4_score: number
          q5_score: number
          role_level: string
          tenure: string
        }
        Update: {
          anonymous_id?: string
          created_at?: string
          department?: string
          employment_type?: string
          id?: string
          lead_id?: string | null
          q1_score?: number
          q2_score?: number
          q3_score?: number
          q4_score?: number
          q5_score?: number
          role_level?: string
          tenure?: string
        }
        Relationships: [
          {
            foreignKeyName: "vibe_check_responses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_vibe_check_property: {
        Args: { check_code: string }
        Returns: {
          lead_id: string
          property_name: string
          staff_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_vibe_check_responses: {
        Args: { lead_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager"],
    },
  },
} as const
