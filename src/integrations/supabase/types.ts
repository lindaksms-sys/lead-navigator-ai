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
          created_at: string
          datetime: string
          id: string
          lead_id: string | null
          notes: string | null
          service_type: string | null
          status: Database["public"]["Enums"]["appointment_status"]
        }
        Insert: {
          created_at?: string
          datetime: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          service_type?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
        }
        Update: {
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
            foreignKeyName: "calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      escalations: {
        Row: {
          call_sid: string
          created_at: string
          handled: boolean | null
          id: string
          notes: string | null
          reason: Database["public"]["Enums"]["escalation_reason"]
        }
        Insert: {
          call_sid: string
          created_at?: string
          handled?: boolean | null
          id?: string
          notes?: string | null
          reason: Database["public"]["Enums"]["escalation_reason"]
        }
        Update: {
          call_sid?: string
          created_at?: string
          handled?: boolean | null
          id?: string
          notes?: string | null
          reason?: Database["public"]["Enums"]["escalation_reason"]
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          budget: Database["public"]["Enums"]["budget_type"] | null
          call_sid: string | null
          category: Database["public"]["Enums"]["lead_category"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
