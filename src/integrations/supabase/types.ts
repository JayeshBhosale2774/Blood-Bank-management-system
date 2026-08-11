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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blood_banks: {
        Row: {
          address: string
          contact: string
          created_at: string
          hospital_name: string
          id: string
          latitude: number
          longitude: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          contact: string
          created_at?: string
          hospital_name: string
          id?: string
          latitude: number
          longitude: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          contact?: string
          created_at?: string
          hospital_name?: string
          id?: string
          latitude?: number
          longitude?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blood_banks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_stock: {
        Row: {
          available_units: number
          blood_bank_id: string
          blood_group: Database["public"]["Enums"]["blood_group"]
          exchange_available: boolean
          id: string
          updated_at: string
        }
        Insert: {
          available_units?: number
          blood_bank_id: string
          blood_group: Database["public"]["Enums"]["blood_group"]
          exchange_available?: boolean
          id?: string
          updated_at?: string
        }
        Update: {
          available_units?: number
          blood_bank_id?: string
          blood_group?: Database["public"]["Enums"]["blood_group"]
          exchange_available?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blood_stock_blood_bank_id_fkey"
            columns: ["blood_bank_id"]
            isOneToOne: false
            referencedRelation: "blood_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          blood_group: string | null
          certificate_number: string
          certificate_type: string
          created_at: string
          donation_count: number
          donor_id: string | null
          id: string
          issued_date: string
          user_id: string
        }
        Insert: {
          blood_group?: string | null
          certificate_number: string
          certificate_type?: string
          created_at?: string
          donation_count?: number
          donor_id?: string | null
          id?: string
          issued_date?: string
          user_id: string
        }
        Update: {
          blood_group?: string | null
          certificate_number?: string
          certificate_type?: string
          created_at?: string
          donation_count?: number
          donor_id?: string | null
          id?: string
          issued_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          age: number
          available: boolean
          blood_group: Database["public"]["Enums"]["blood_group"]
          city: string
          contact: string
          created_at: string
          id: string
          latitude: number
          longitude: number
          name: string
          user_id: string | null
        }
        Insert: {
          age: number
          available?: boolean
          blood_group: Database["public"]["Enums"]["blood_group"]
          city: string
          contact: string
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          name: string
          user_id?: string | null
        }
        Update: {
          age?: number
          available?: boolean
          blood_group?: Database["public"]["Enums"]["blood_group"]
          city?: string
          contact?: string
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          created_at: string
          hospital_id: string | null
          id: string
          requester_id: string
          requester_name: string
          status: string
          updated_at: string
        }
        Insert: {
          blood_group: Database["public"]["Enums"]["blood_group"]
          created_at?: string
          hospital_id?: string | null
          id?: string
          requester_id: string
          requester_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          blood_group?: Database["public"]["Enums"]["blood_group"]
          created_at?: string
          hospital_id?: string | null
          id?: string
          requester_id?: string
          requester_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "blood_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
    }
    Enums: {
      blood_group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      user_role: "person" | "hospital"
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
      blood_group: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      user_role: ["person", "hospital"],
    },
  },
} as const
