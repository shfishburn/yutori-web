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
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      coach_analyses: {
        Row: {
          analysis: Json
          created_at: string
          expires_at: string
          id: string
          input_hash: string
          user_id: string
        }
        Insert: {
          analysis: Json
          created_at?: string
          expires_at?: string
          id?: string
          input_hash: string
          user_id: string
        }
        Update: {
          analysis?: Json
          created_at?: string
          expires_at?: string
          id?: string
          input_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_protocols: {
        Row: {
          created_at: string
          id: string
          narrative: Json
          protocol_type: string
          schedule: Json
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          narrative: Json
          protocol_type: string
          schedule: Json
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          narrative?: Json
          protocol_type?: string
          schedule?: Json
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      commerce_customers: {
        Row: {
          conflict_reason: string | null
          created_at: string
          email_domain: string
          email_hash: string
          id: number
          legal_basis: string
          link_source: string
          linked_at: string | null
          metadata: Json
          shopify_customer_id: string | null
          shopify_customer_state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conflict_reason?: string | null
          created_at?: string
          email_domain?: string
          email_hash: string
          id?: never
          legal_basis?: string
          link_source?: string
          linked_at?: string | null
          metadata?: Json
          shopify_customer_id?: string | null
          shopify_customer_state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conflict_reason?: string | null
          created_at?: string
          email_domain?: string
          email_hash?: string
          id?: never
          legal_basis?: string
          link_source?: string
          linked_at?: string | null
          metadata?: Json
          shopify_customer_id?: string | null
          shopify_customer_state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commerce_link_audit: {
        Row: {
          action: string
          attempted_email_hash: string | null
          created_at: string
          external_ref: string | null
          id: number
          reason: string | null
          resolved_user_id: string | null
          shopify_customer_id: string | null
          source: string
        }
        Insert: {
          action: string
          attempted_email_hash?: string | null
          created_at?: string
          external_ref?: string | null
          id?: never
          reason?: string | null
          resolved_user_id?: string | null
          shopify_customer_id?: string | null
          source?: string
        }
        Update: {
          action?: string
          attempted_email_hash?: string | null
          created_at?: string
          external_ref?: string | null
          id?: never
          reason?: string | null
          resolved_user_id?: string | null
          shopify_customer_id?: string | null
          source?: string
        }
        Relationships: []
      }
      gamification_credits: {
        Row: {
          created_at: string
          credit_key: string
          id: number
          source_id: string
          source_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_key: string
          id?: never
          source_id: string
          source_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          credit_key?: string
          id?: never
          source_id?: string
          source_type?: string
          user_id?: string
        }
        Relationships: []
      }
      health_samples: {
        Row: {
          heart_rate: number
          hrv: number | null
          id: number
          recorded_at: string
          session_id: string | null
          source: string
          user_id: string | null
        }
        Insert: {
          heart_rate: number
          hrv?: number | null
          id?: never
          recorded_at?: string
          session_id?: string | null
          source?: string
          user_id?: string | null
        }
        Update: {
          heart_rate?: number
          hrv?: number | null
          id?: never
          recorded_at?: string
          session_id?: string | null
          source?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_samples_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sensor_samples: {
        Row: {
          battery: number
          humidity: number
          id: number
          pressure: number
          recorded_at: string
          session_id: string | null
          temperature: number
          user_id: string | null
        }
        Insert: {
          battery: number
          humidity: number
          id?: never
          pressure: number
          recorded_at?: string
          session_id?: string | null
          temperature: number
          user_id?: string | null
        }
        Update: {
          battery?: number
          humidity?: number
          id?: never
          pressure?: number
          recorded_at?: string
          session_id?: string | null
          temperature?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_samples_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          ai_insight: string | null
          avg_humidity_pct: number | null
          calorie_confidence: string | null
          client_id: string | null
          contrast_group_id: string | null
          contrast_id: string | null
          created_at: string
          device_id: string | null
          duration_ms: number | null
          ended_at: string | null
          hrv_trend: number | null
          id: string
          min_temp_c: number | null
          net_thermal_burn: number | null
          pause_count: number
          paused_duration_ms: number
          peak_humidity_pct: number | null
          peak_temp_c: number | null
          rlt_active: boolean
          safety_sos_count: number
          safety_warning_count: number
          sensor_ble_id: string | null
          session_type: string | null
          split_index: number
          started_at: string
          total_kcal: number | null
          transition_ms: number
          user_id: string | null
        }
        Insert: {
          ai_insight?: string | null
          avg_humidity_pct?: number | null
          calorie_confidence?: string | null
          client_id?: string | null
          contrast_group_id?: string | null
          contrast_id?: string | null
          created_at?: string
          device_id?: string | null
          duration_ms?: number | null
          ended_at?: string | null
          hrv_trend?: number | null
          id?: string
          min_temp_c?: number | null
          net_thermal_burn?: number | null
          pause_count?: number
          paused_duration_ms?: number
          peak_humidity_pct?: number | null
          peak_temp_c?: number | null
          rlt_active?: boolean
          safety_sos_count?: number
          safety_warning_count?: number
          sensor_ble_id?: string | null
          session_type?: string | null
          split_index?: number
          started_at?: string
          total_kcal?: number | null
          transition_ms?: number
          user_id?: string | null
        }
        Update: {
          ai_insight?: string | null
          avg_humidity_pct?: number | null
          calorie_confidence?: string | null
          client_id?: string | null
          contrast_group_id?: string | null
          contrast_id?: string | null
          created_at?: string
          device_id?: string | null
          duration_ms?: number | null
          ended_at?: string | null
          hrv_trend?: number | null
          id?: string
          min_temp_c?: number | null
          net_thermal_burn?: number | null
          pause_count?: number
          paused_duration_ms?: number
          peak_humidity_pct?: number | null
          peak_temp_c?: number | null
          rlt_active?: boolean
          safety_sos_count?: number
          safety_warning_count?: number
          sensor_ble_id?: string | null
          session_type?: string | null
          split_index?: number
          started_at?: string
          total_kcal?: number | null
          transition_ms?: number
          user_id?: string | null
        }
        Relationships: []
      }
      telemetry_events: {
        Row: {
          created_at: string
          event_name: string
          id: number
          payload: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: never
          payload?: Json
          user_id?: string
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: never
          payload?: Json
          user_id?: string
        }
        Relationships: []
      }
      terra_webhook_log: {
        Row: {
          event_type: string | null
          expires_at: string
          id: number
          payload: Json
          received_at: string
        }
        Insert: {
          event_type?: string | null
          expires_at?: string
          id?: never
          payload: Json
          received_at?: string
        }
        Update: {
          event_type?: string | null
          expires_at?: string
          id?: never
          payload?: Json
          received_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_key: string
          earned_at: string
          id: number
          meta: Json
          user_id: string
        }
        Insert: {
          achievement_key: string
          earned_at?: string
          id?: never
          meta?: Json
          user_id: string
        }
        Update: {
          achievement_key?: string
          earned_at?: string
          id?: never
          meta?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_gamification_state: {
        Row: {
          best_streak_days: number
          contrast_completed_count: number
          current_streak_days: number
          last_completed_day_utc: string | null
          level: number
          plunge_completed_count: number
          sauna_completed_count: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          best_streak_days?: number
          contrast_completed_count?: number
          current_streak_days?: number
          last_completed_day_utc?: string | null
          level?: number
          plunge_completed_count?: number
          sauna_completed_count?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          best_streak_days?: number
          contrast_completed_count?: number
          current_streak_days?: number
          last_completed_day_utc?: string | null
          level?: number
          plunge_completed_count?: number
          sauna_completed_count?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          body_fat_pct: number | null
          created_at: string
          gender: string | null
          height_cm: number | null
          resting_hr: number | null
          rlt_enabled: boolean
          rlt_panel: Json | null
          sauna_type: string | null
          terms_accepted_at: string | null
          unit_preference: string
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          body_fat_pct?: number | null
          created_at?: string
          gender?: string | null
          height_cm?: number | null
          resting_hr?: number | null
          rlt_enabled?: boolean
          rlt_panel?: Json | null
          sauna_type?: string | null
          terms_accepted_at?: string | null
          unit_preference?: string
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          body_fat_pct?: number | null
          created_at?: string
          gender?: string | null
          height_cm?: number | null
          resting_hr?: number | null
          rlt_enabled?: boolean
          rlt_panel?: Json | null
          sauna_type?: string | null
          terms_accepted_at?: string | null
          unit_preference?: string
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      email_sha256_hex: { Args: { p_email: string }; Returns: string }
      ensure_commerce_customer_row: {
        Args: never
        Returns: {
          conflict_reason: string | null
          created_at: string
          email_domain: string
          email_hash: string
          id: number
          legal_basis: string
          link_source: string
          linked_at: string | null
          metadata: Json
          shopify_customer_id: string | null
          shopify_customer_state: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "commerce_customers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      link_shopify_customer_by_email: {
        Args: {
          p_email: string
          p_external_ref?: string
          p_shopify_customer_id: string
          p_source?: string
        }
        Returns: {
          conflict_reason: string | null
          created_at: string
          email_domain: string
          email_hash: string
          id: number
          legal_basis: string
          link_source: string
          linked_at: string | null
          metadata: Json
          shopify_customer_id: string | null
          shopify_customer_state: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "commerce_customers"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      normalize_email: { Args: { p_email: string }; Returns: string }
      purge_commerce_link_audit: {
        Args: { p_older_than?: unknown }
        Returns: number
      }
      purge_terra_webhook_log: {
        Args: { p_older_than?: unknown }
        Returns: number
      }
      require_service_role: { Args: never; Returns: undefined }
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
