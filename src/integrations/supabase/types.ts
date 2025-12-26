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
      attendance_records: {
        Row: {
          created_at: string
          id: string
          latitude: number
          longitude: number
          room_number: string
          selfie_url: string | null
          timestamp: string
          type: string
          user_id: string
          user_name: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          room_number: string
          selfie_url?: string | null
          timestamp?: string
          type: string
          user_id: string
          user_name: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          room_number?: string
          selfie_url?: string | null
          timestamp?: string
          type?: string
          user_id?: string
          user_name?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      gate_passes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          departure_date: string
          destination: string
          entry_time: string | null
          exit_time: string | null
          expected_return: string
          id: string
          qr_code: string | null
          reason: string
          room_number: string
          status: string
          user_id: string
          user_name: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          departure_date: string
          destination: string
          entry_time?: string | null
          exit_time?: string | null
          expected_return: string
          id?: string
          qr_code?: string | null
          reason: string
          room_number: string
          status?: string
          user_id: string
          user_name: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          departure_date?: string
          destination?: string
          entry_time?: string | null
          exit_time?: string | null
          expected_return?: string
          id?: string
          qr_code?: string | null
          reason?: string
          room_number?: string
          status?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      hostelmates: {
        Row: {
          course: string | null
          created_at: string
          hostel_block: string
          id: string
          name: string
          room_number: string
          user_id: string | null
          year: string | null
        }
        Insert: {
          course?: string | null
          created_at?: string
          hostel_block: string
          id?: string
          name: string
          room_number: string
          user_id?: string | null
          year?: string | null
        }
        Update: {
          course?: string | null
          created_at?: string
          hostel_block?: string
          id?: string
          name?: string
          room_number?: string
          user_id?: string | null
          year?: string | null
        }
        Relationships: []
      }
      maintenance_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          description: string
          id: string
          priority: string
          resolution: string | null
          room_number: string
          status: string
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          priority?: string
          resolution?: string | null
          room_number: string
          status?: string
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          resolution?: string | null
          room_number?: string
          status?: string
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      movement_logs: {
        Row: {
          created_at: string
          gate_pass_id: string
          id: string
          scanned_by: string
          timestamp: string
          type: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          gate_pass_id: string
          id?: string
          scanned_by: string
          timestamp?: string
          type: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          gate_pass_id?: string
          id?: string
          scanned_by?: string
          timestamp?: string
          type?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "movement_logs_gate_pass_id_fkey"
            columns: ["gate_pass_id"]
            isOneToOne: false
            referencedRelation: "gate_passes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          hostel_block: string | null
          id: string
          name: string
          profile_image: string | null
          room_number: string | null
          student_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          hostel_block?: string | null
          id?: string
          name: string
          profile_image?: string | null
          room_number?: string | null
          student_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          hostel_block?: string | null
          id?: string
          name?: string
          profile_image?: string | null
          room_number?: string | null
          student_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "warden" | "security"
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
      app_role: ["student", "warden", "security"],
    },
  },
} as const
