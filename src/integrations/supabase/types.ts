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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      "9 Mobile COOPORATE GIFTING": {
        Row: {
          created_at: string
          id: string
          price: number
          size: string
          validity: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          size: string
          validity: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          size?: string
          validity?: string
          value?: number
        }
        Relationships: []
      }
      "9 MOBILE SME": {
        Row: {
          created_at: string
          id: string
          price: number
          size: string
          validity: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          size: string
          validity: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          size?: string
          validity?: string
          value?: number
        }
        Relationships: []
      }
      "AIRTEL DATA CARD COOPORATE GIFTING": {
        Row: {
          created_at: string
          id: string
          price: number
          size: string
          validity: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          size: string
          validity: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          size?: string
          validity?: string
          value?: number
        }
        Relationships: []
      }
      "AIRTEL GIFTING PROMO": {
        Row: {
          created_at: string
          id: string
          price: number
          size: string
          validity: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          size: string
          validity: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          size?: string
          validity?: string
          value?: number
        }
        Relationships: []
      }
      "AIRTEL SME": {
        Row: {
          created_at: string
          id: string
          price: number
          size: string
          validity: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          size: string
          validity: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          size?: string
          validity?: string
          value?: number
        }
        Relationships: []
      }
      beneficiaries: {
        Row: {
          created_at: string
          id: string
          mobile_network: string
          mobile_number: string
          network_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mobile_network: string
          mobile_number: string
          network_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mobile_network?: string
          mobile_number?: string
          network_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      data_bundle_beneficiaries: {
        Row: {
          created_at: string
          id: string
          mobile_network: string
          mobile_number: string
          network_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mobile_network: string
          mobile_number: string
          network_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mobile_network?: string
          mobile_number?: string
          network_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      DSTV: {
        Row: {
          created_at: string
          description: string
          id: string
          price: number
          value: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          price: number
          value: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          price?: number
          value?: string
        }
        Relationships: []
      }
      ELECTRICITY: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          value: string
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          id?: string
          value: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          value?: string
        }
        Relationships: []
      }
      "GLO COOPORATE GIFTING": {
        Row: {
          created_at: string
          id: string
          price: number
          size: string
          validity: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          size: string
          validity: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          size?: string
          validity?: string
          value?: number
        }
        Relationships: []
      }
      "GLO GIFTING PROMO": {
        Row: {
          created_at: string
          id: string
          price: number
          size: string
          validity: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          size: string
          validity: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          size?: string
          validity?: string
          value?: number
        }
        Relationships: []
      }
      GOTV: {
        Row: {
          created_at: string
          description: string
          id: string
          price: number
          value: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          price: number
          value: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          price?: number
          value?: string
        }
        Relationships: []
      }
      "MTN COOPORATE GIFTING": {
        Row: {
          created_at: string
          id: string
          price: number
          size: string
          validity: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          size: string
          validity: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          size?: string
          validity?: string
          value?: number
        }
        Relationships: []
      }
      "MTN DATA CARD SME": {
        Row: {
          created_at: string
          id: string
          price: number
          size: string
          validity: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          size: string
          validity: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          size?: string
          validity?: string
          value?: number
        }
        Relationships: []
      }
      "MTN GIFTING": {
        Row: {
          created_at: string
          id: string
          price: number
          size: string
          validity: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          size: string
          validity: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          size?: string
          validity?: string
          value?: number
        }
        Relationships: []
      }
      "MTN GIFTING PROMO": {
        Row: {
          created_at: string
          id: string
          price: number
          size: string
          validity: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          size: string
          validity: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          size?: string
          validity?: string
          value?: number
        }
        Relationships: []
      }
      "MTN SME": {
        Row: {
          created_at: string
          id: string
          price: number
          size: string
          validity: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          size: string
          validity: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          size?: string
          validity?: string
          value?: number
        }
        Relationships: []
      }
      STARTIMES: {
        Row: {
          created_at: string
          description: string
          id: string
          price: number
          value: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          price: number
          value: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          price?: number
          value?: string
        }
        Relationships: []
      }
      transaction_history: {
        Row: {
          amount: number
          api_response: Json | null
          created_at: string
          id: string
          mobile_network: string
          mobile_number: string
          order_id: string | null
          status: string
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          api_response?: Json | null
          created_at?: string
          id?: string
          mobile_network: string
          mobile_number: string
          order_id?: string | null
          status?: string
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          api_response?: Json | null
          created_at?: string
          id?: string
          mobile_network?: string
          mobile_number?: string
          order_id?: string | null
          status?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          balance: number | null
          biometric_registered: boolean | null
          created_at: string
          email: string
          flutterwave_account_name: string | null
          flutterwave_account_number: string | null
          flutterwave_bank_name: string | null
          full_name: string
          id: string
          is_active: boolean | null
          otp_sent_at: string | null
          password_hash: string
          paystack_account_name: string | null
          paystack_account_number: string | null
          paystack_bank_name: string | null
          phone_number: string
          referral_code: string | null
          sent_otp: string | null
          transaction_pin: string
          updated_at: string
          username: string
          virtual_account_bank: string | null
          virtual_account_number: string | null
          welcome_email_sent: boolean | null
        }
        Insert: {
          balance?: number | null
          biometric_registered?: boolean | null
          created_at?: string
          email: string
          flutterwave_account_name?: string | null
          flutterwave_account_number?: string | null
          flutterwave_bank_name?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          otp_sent_at?: string | null
          password_hash: string
          paystack_account_name?: string | null
          paystack_account_number?: string | null
          paystack_bank_name?: string | null
          phone_number: string
          referral_code?: string | null
          sent_otp?: string | null
          transaction_pin: string
          updated_at?: string
          username: string
          virtual_account_bank?: string | null
          virtual_account_number?: string | null
          welcome_email_sent?: boolean | null
        }
        Update: {
          balance?: number | null
          biometric_registered?: boolean | null
          created_at?: string
          email?: string
          flutterwave_account_name?: string | null
          flutterwave_account_number?: string | null
          flutterwave_bank_name?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          otp_sent_at?: string | null
          password_hash?: string
          paystack_account_name?: string | null
          paystack_account_number?: string | null
          paystack_bank_name?: string | null
          phone_number?: string
          referral_code?: string | null
          sent_otp?: string | null
          transaction_pin?: string
          updated_at?: string
          username?: string
          virtual_account_bank?: string | null
          virtual_account_number?: string | null
          welcome_email_sent?: boolean | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          id: string
          processed_at: string
          source: string
          webhook_data: Json
        }
        Insert: {
          created_at?: string
          id?: string
          processed_at?: string
          source: string
          webhook_data: Json
        }
        Update: {
          created_at?: string
          id?: string
          processed_at?: string
          source?: string
          webhook_data?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_field_exists: {
        Args: { field_name: string; field_value: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
