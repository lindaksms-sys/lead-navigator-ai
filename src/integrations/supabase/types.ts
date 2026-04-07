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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          calendar_link: string | null
          calendly_event_id: string | null
          calendly_invitee_uri: string | null
          client_id: string | null
          created_at: string
          datetime: string
          id: string
          lead_id: string | null
          notes: string | null
          service_type: string | null
          status: Database["public"]["Enums"]["appointment_status"]
        }
        Insert: {
          calendar_link?: string | null
          calendly_event_id?: string | null
          calendly_invitee_uri?: string | null
          client_id?: string | null
          created_at?: string
          datetime: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          service_type?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
        }
        Update: {
          calendar_link?: string | null
          calendly_event_id?: string | null
          calendly_invitee_uri?: string | null
          client_id?: string | null
          created_at?: string
          datetime?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          service_type?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          call_sid: string
          client_id: string | null
          created_at: string
          direction: Database["public"]["Enums"]["call_direction"] | null
          duration_seconds: number | null
          id: string
          lead_id: string | null
          phone_number: string | null
          status: string | null
          transcript: string | null
        }
        Insert: {
          call_sid: string
          client_id?: string | null
          created_at?: string
          direction?: Database["public"]["Enums"]["call_direction"] | null
          duration_seconds?: number | null
          id?: string
          lead_id?: string | null
          phone_number?: string | null
          status?: string | null
          transcript?: string | null
        }
        Update: {
          call_sid?: string
          client_id?: string | null
          created_at?: string
          direction?: Database["public"]["Enums"]["call_direction"] | null
          duration_seconds?: number | null
          id?: string
          lead_id?: string | null
          phone_number?: string | null
          status?: string | null
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      client_activity_log: {
        Row: {
          activity_type: string
          client_id: string
          created_at: string
          description: string
          id: string
        }
        Insert: {
          activity_type: string
          client_id: string
          created_at?: string
          description: string
          id?: string
        }
        Update: {
          activity_type?: string
          client_id?: string
          created_at?: string
          description?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_activity_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_settings: {
        Row: {
          business_address: string | null
          business_hours: Json | null
          business_name: string | null
          business_phone: string | null
          client_id: string
          created_at: string
          id: string
          logo_url: string | null
          notification_preferences: Json | null
          primary_color: string | null
          secondary_color: string | null
          service_zip_codes: string[] | null
          updated_at: string
        }
        Insert: {
          business_address?: string | null
          business_hours?: Json | null
          business_name?: string | null
          business_phone?: string | null
          client_id: string
          created_at?: string
          id?: string
          logo_url?: string | null
          notification_preferences?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          service_zip_codes?: string[] | null
          updated_at?: string
        }
        Update: {
          business_address?: string | null
          business_hours?: Json | null
          business_name?: string | null
          business_phone?: string | null
          client_id?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          notification_preferences?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          service_zip_codes?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_settings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      escalations: {
        Row: {
          call_sid: string
          client_id: string | null
          created_at: string
          handled: boolean | null
          id: string
          notes: string | null
          reason: Database["public"]["Enums"]["escalation_reason"]
        }
        Insert: {
          call_sid: string
          client_id?: string | null
          created_at?: string
          handled?: boolean | null
          id?: string
          notes?: string | null
          reason: Database["public"]["Enums"]["escalation_reason"]
        }
        Update: {
          call_sid?: string
          client_id?: string | null
          created_at?: string
          handled?: boolean | null
          id?: string
          notes?: string | null
          reason?: Database["public"]["Enums"]["escalation_reason"]
        }
        Relationships: [
          {
            foreignKeyName: "escalations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          is_active: boolean
          provider: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          provider: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          provider?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          budget: Database["public"]["Enums"]["budget_type"] | null
          call_sid: string | null
          category: Database["public"]["Enums"]["lead_category"]
          client_id: string | null
          created_at: string
          decision_maker: boolean | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          property_type: Database["public"]["Enums"]["property_type"] | null
          score: number
          service_type: Database["public"]["Enums"]["service_type"] | null
          source: string | null
          square_footage: number | null
          status: Database["public"]["Enums"]["lead_status"]
          timeline: Database["public"]["Enums"]["timeline_type"] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          budget?: Database["public"]["Enums"]["budget_type"] | null
          call_sid?: string | null
          category?: Database["public"]["Enums"]["lead_category"]
          client_id?: string | null
          created_at?: string
          decision_maker?: boolean | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          property_type?: Database["public"]["Enums"]["property_type"] | null
          score?: number
          service_type?: Database["public"]["Enums"]["service_type"] | null
          source?: string | null
          square_footage?: number | null
          status?: Database["public"]["Enums"]["lead_status"]
          timeline?: Database["public"]["Enums"]["timeline_type"] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          budget?: Database["public"]["Enums"]["budget_type"] | null
          call_sid?: string | null
          category?: Database["public"]["Enums"]["lead_category"]
          client_id?: string | null
          created_at?: string
          decision_maker?: boolean | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          property_type?: Database["public"]["Enums"]["property_type"] | null
          score?: number
          service_type?: Database["public"]["Enums"]["service_type"] | null
          source?: string | null
          square_footage?: number | null
          status?: Database["public"]["Enums"]["lead_status"]
          timeline?: Database["public"]["Enums"]["timeline_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          content: string
          created_at: string
          id: string
          lead_id: string | null
          phone_sent_to: string
          status: string
          twilio_sid: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lead_id?: string | null
          phone_sent_to: string
          status?: string
          twilio_sid?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          phone_sent_to?: string
          status?: string
          twilio_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_client_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client_admin" | "client_viewer" | "super_admin"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      budget_type:
        | "under_500"
        | "500_2000"
        | "2000_5000"
        | "5000_10000"
        | "over_10000"
        | "unknown"
      call_direction: "inbound" | "outbound"
      escalation_reason:
        | "complex_project"
        | "pricing_complaint"
        | "robot_question"
        | "language_barrier"
        | "other"
      lead_category: "Hot" | "Warm" | "Cold"
      lead_status:
        | "new"
        | "contacted"
        | "quoted"
        | "scheduled"
        | "won"
        | "lost"
        | "nurture"
      property_type: "single_family" | "condo" | "townhouse" | "commercial"
      service_type: "repair" | "maintenance" | "installation" | "emergency"
      timeline_type:
        | "emergency"
        | "today"
        | "this_week"
        | "this_month"
        | "planning"
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
      app_role: ["admin", "client_admin", "client_viewer", "super_admin"],
      appointment_status: [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      budget_type: [
        "under_500",
        "500_2000",
        "2000_5000",
        "5000_10000",
        "over_10000",
        "unknown",
      ],
      call_direction: ["inbound", "outbound"],
      escalation_reason: [
        "complex_project",
        "pricing_complaint",
        "robot_question",
        "language_barrier",
        "other",
      ],
      lead_category: ["Hot", "Warm", "Cold"],
      lead_status: [
        "new",
        "contacted",
        "quoted",
        "scheduled",
        "won",
        "lost",
        "nurture",
      ],
      property_type: ["single_family", "condo", "townhouse", "commercial"],
      service_type: ["repair", "maintenance", "installation", "emergency"],
      timeline_type: [
        "emergency",
        "today",
        "this_week",
        "this_month",
        "planning",
      ],
    },
  },
} as const
