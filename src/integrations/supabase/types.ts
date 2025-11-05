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
      ambassador_profiles: {
        Row: {
          active_referrals: number
          approved_at: string | null
          approved_by: string | null
          avg_stars_per_transaction: number | null
          created_at: string
          current_tier: Database["public"]["Enums"]["app_tier"]
          first_login_at: string | null
          id: string
          lifetime_stars: number
          password_change_required: boolean | null
          pending_earnings: number
          quality_transaction_rate: number | null
          referral_code: string
          social_posts_this_month: number
          status: string
          telegram_id: string | null
          telegram_username: string | null
          tier_progress: number
          total_earnings: number
          total_referrals: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active_referrals?: number
          approved_at?: string | null
          approved_by?: string | null
          avg_stars_per_transaction?: number | null
          created_at?: string
          current_tier?: Database["public"]["Enums"]["app_tier"]
          first_login_at?: string | null
          id?: string
          lifetime_stars?: number
          password_change_required?: boolean | null
          pending_earnings?: number
          quality_transaction_rate?: number | null
          referral_code: string
          social_posts_this_month?: number
          status?: string
          telegram_id?: string | null
          telegram_username?: string | null
          tier_progress?: number
          total_earnings?: number
          total_referrals?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active_referrals?: number
          approved_at?: string | null
          approved_by?: string | null
          avg_stars_per_transaction?: number | null
          created_at?: string
          current_tier?: Database["public"]["Enums"]["app_tier"]
          first_login_at?: string | null
          id?: string
          lifetime_stars?: number
          password_change_required?: boolean | null
          pending_earnings?: number
          quality_transaction_rate?: number | null
          referral_code?: string
          social_posts_this_month?: number
          status?: string
          telegram_id?: string | null
          telegram_username?: string | null
          tier_progress?: number
          total_earnings?: number
          total_referrals?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          ambassador_id: string | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          ambassador_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          ambassador_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          created_at: string
          email: string
          experience: string | null
          full_name: string
          id: string
          phone: string | null
          referral_code: string | null
          referral_strategy: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_media_links: Json | null
          status: string
          telegram_id: string | null
          telegram_username: string | null
          user_id: string | null
          why_join: string | null
        }
        Insert: {
          created_at?: string
          email: string
          experience?: string | null
          full_name: string
          id?: string
          phone?: string | null
          referral_code?: string | null
          referral_strategy?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media_links?: Json | null
          status?: string
          telegram_id?: string | null
          telegram_username?: string | null
          user_id?: string | null
          why_join?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          referral_code?: string | null
          referral_strategy?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media_links?: Json | null
          status?: string
          telegram_id?: string | null
          telegram_username?: string | null
          user_id?: string | null
          why_join?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          content_type: string | null
          created_at: string | null
          file_size: number | null
          file_url: string | null
          filename: string
          id: string
          message_id: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          file_size?: number | null
          file_url?: string | null
          filename: string
          id?: string
          message_id?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          file_size?: number | null
          file_url?: string | null
          filename?: string
          id?: string
          message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_events: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          message_id: string | null
          occurred_at: string | null
          user_agent: string | null
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          message_id?: string | null
          occurred_at?: string | null
          user_agent?: string | null
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          message_id?: string | null
          occurred_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_events_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          html_template: string
          id: string
          is_active: boolean | null
          message_type: Database["public"]["Enums"]["message_type"]
          name: string
          subject_template: string
          text_template: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          html_template: string
          id?: string
          is_active?: boolean | null
          message_type: Database["public"]["Enums"]["message_type"]
          name: string
          subject_template: string
          text_template?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          html_template?: string
          id?: string
          is_active?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"]
          name?: string
          subject_template?: string
          text_template?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          ambassador_id: string | null
          clicked_at: string | null
          content_html: string | null
          content_text: string | null
          created_at: string | null
          delivered_at: string | null
          email_service: string | null
          error_message: string | null
          external_message_id: string | null
          failed_at: string | null
          id: string
          max_retries: number | null
          message_type: Database["public"]["Enums"]["message_type"]
          metadata: Json | null
          opened_at: string | null
          priority: Database["public"]["Enums"]["message_priority"] | null
          recipient_email: string
          recipient_name: string | null
          retry_count: number | null
          sent_at: string | null
          sent_by: string | null
          sent_via: string | null
          status: Database["public"]["Enums"]["message_status"] | null
          subject: string
          template_name: string | null
          updated_at: string | null
          user_id: string | null
          variables: Json | null
        }
        Insert: {
          ambassador_id?: string | null
          clicked_at?: string | null
          content_html?: string | null
          content_text?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email_service?: string | null
          error_message?: string | null
          external_message_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          message_type: Database["public"]["Enums"]["message_type"]
          metadata?: Json | null
          opened_at?: string | null
          priority?: Database["public"]["Enums"]["message_priority"] | null
          recipient_email: string
          recipient_name?: string | null
          retry_count?: number | null
          sent_at?: string | null
          sent_by?: string | null
          sent_via?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          subject: string
          template_name?: string | null
          updated_at?: string | null
          user_id?: string | null
          variables?: Json | null
        }
        Update: {
          ambassador_id?: string | null
          clicked_at?: string | null
          content_html?: string | null
          content_text?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email_service?: string | null
          error_message?: string | null
          external_message_id?: string | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json | null
          opened_at?: string | null
          priority?: Database["public"]["Enums"]["message_priority"] | null
          recipient_email?: string
          recipient_name?: string | null
          retry_count?: number | null
          sent_at?: string | null
          sent_by?: string | null
          sent_via?: string | null
          status?: Database["public"]["Enums"]["message_status"] | null
          subject?: string
          template_name?: string | null
          updated_at?: string | null
          user_id?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          ambassador_id: string
          amount: number
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          period_end: string
          period_start: string
          quality_bonus: number | null
          status: Database["public"]["Enums"]["payout_status"]
          total_amount: number
        }
        Insert: {
          ambassador_id: string
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          period_end: string
          period_start: string
          quality_bonus?: number | null
          status?: Database["public"]["Enums"]["payout_status"]
          total_amount: number
        }
        Update: {
          ambassador_id?: string
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          period_end?: string
          period_start?: string
          quality_bonus?: number | null
          status?: Database["public"]["Enums"]["payout_status"]
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "payouts_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          telegram_username: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          telegram_username?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          telegram_username?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          ambassador_id: string
          created_at: string
          customer_email: string | null
          customer_name: string | null
          first_purchase_at: string | null
          id: string
          referral_code: string
          referred_at: string
          status: string
          total_purchases: number
          total_spent: number
        }
        Insert: {
          ambassador_id: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          first_purchase_at?: string | null
          id?: string
          referral_code: string
          referred_at?: string
          status?: string
          total_purchases?: number
          total_spent?: number
        }
        Update: {
          ambassador_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          first_purchase_at?: string | null
          id?: string
          referral_code?: string
          referred_at?: string
          status?: string
          total_purchases?: number
          total_spent?: number
        }
        Relationships: [
          {
            foreignKeyName: "referrals_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          ambassador_id: string
          created_at: string
          engagement_count: number | null
          id: string
          platform: string
          post_content: string | null
          post_url: string | null
          posted_at: string
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          ambassador_id: string
          created_at?: string
          engagement_count?: number | null
          id?: string
          platform: string
          post_content?: string | null
          post_url?: string | null
          posted_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          ambassador_id?: string
          created_at?: string
          engagement_count?: number | null
          id?: string
          platform?: string
          post_content?: string | null
          post_url?: string | null
          posted_at?: string
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      starstore_analytics_cache: {
        Row: {
          active_referrals: number | null
          conversion_rate: number | null
          id: string
          month_referrals: number | null
          month_users: number | null
          starstore_timestamp: string | null
          synced_at: string | null
          today_referrals: number | null
          today_users: number | null
          total_earnings: number | null
          total_referrals: number | null
          total_stars_traded: number | null
          total_transactions: number | null
          total_users: number | null
          week_referrals: number | null
          week_users: number | null
        }
        Insert: {
          active_referrals?: number | null
          conversion_rate?: number | null
          id?: string
          month_referrals?: number | null
          month_users?: number | null
          starstore_timestamp?: string | null
          synced_at?: string | null
          today_referrals?: number | null
          today_users?: number | null
          total_earnings?: number | null
          total_referrals?: number | null
          total_stars_traded?: number | null
          total_transactions?: number | null
          total_users?: number | null
          week_referrals?: number | null
          week_users?: number | null
        }
        Update: {
          active_referrals?: number | null
          conversion_rate?: number | null
          id?: string
          month_referrals?: number | null
          month_users?: number | null
          starstore_timestamp?: string | null
          synced_at?: string | null
          today_referrals?: number | null
          today_users?: number | null
          total_earnings?: number | null
          total_referrals?: number | null
          total_stars_traded?: number | null
          total_transactions?: number | null
          total_users?: number | null
          week_referrals?: number | null
          week_users?: number | null
        }
        Relationships: []
      }
      starstore_referrals_cache: {
        Row: {
          date_referred: string | null
          id: string
          referred_user_id: string
          referred_username: string | null
          referrer_is_ambassador: boolean | null
          referrer_tier: string | null
          referrer_user_id: string
          referrer_username: string | null
          starstore_id: string
          status: string
          synced_at: string | null
          withdrawn: boolean | null
        }
        Insert: {
          date_referred?: string | null
          id?: string
          referred_user_id: string
          referred_username?: string | null
          referrer_is_ambassador?: boolean | null
          referrer_tier?: string | null
          referrer_user_id: string
          referrer_username?: string | null
          starstore_id: string
          status: string
          synced_at?: string | null
          withdrawn?: boolean | null
        }
        Update: {
          date_referred?: string | null
          id?: string
          referred_user_id?: string
          referred_username?: string | null
          referrer_is_ambassador?: boolean | null
          referrer_tier?: string | null
          referrer_user_id?: string
          referrer_username?: string | null
          starstore_id?: string
          status?: string
          synced_at?: string | null
          withdrawn?: boolean | null
        }
        Relationships: []
      }
      starstore_transactions_cache: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          is_premium: boolean | null
          premium_duration: number | null
          stars: number
          starstore_id: string
          status: string
          synced_at: string | null
          telegram_id: string
          type: string
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          premium_duration?: number | null
          stars: number
          starstore_id: string
          status: string
          synced_at?: string | null
          telegram_id: string
          type: string
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          premium_duration?: number | null
          stars?: number
          starstore_id?: string
          status?: string
          synced_at?: string | null
          telegram_id?: string
          type?: string
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      starstore_users_cache: {
        Row: {
          active_referrals: number | null
          ambassador_synced_at: string | null
          ambassador_tier: string | null
          buy_orders: number | null
          created_at: string | null
          id: string
          is_ambassador: boolean | null
          last_active: string | null
          pending_referrals: number | null
          sell_orders: number | null
          synced_at: string | null
          telegram_id: string
          total_earnings: number | null
          total_referrals: number | null
          total_stars_earned: number | null
          username: string | null
        }
        Insert: {
          active_referrals?: number | null
          ambassador_synced_at?: string | null
          ambassador_tier?: string | null
          buy_orders?: number | null
          created_at?: string | null
          id?: string
          is_ambassador?: boolean | null
          last_active?: string | null
          pending_referrals?: number | null
          sell_orders?: number | null
          synced_at?: string | null
          telegram_id: string
          total_earnings?: number | null
          total_referrals?: number | null
          total_stars_earned?: number | null
          username?: string | null
        }
        Update: {
          active_referrals?: number | null
          ambassador_synced_at?: string | null
          ambassador_tier?: string | null
          buy_orders?: number | null
          created_at?: string | null
          id?: string
          is_ambassador?: boolean | null
          last_active?: string | null
          pending_referrals?: number | null
          sell_orders?: number | null
          synced_at?: string | null
          telegram_id?: string
          total_earnings?: number | null
          total_referrals?: number | null
          total_stars_earned?: number | null
          username?: string | null
        }
        Relationships: []
      }
      tier_configs: {
        Row: {
          base_earnings: number
          commission_rate: number
          created_at: string
          id: string
          level: number
          min_monthly_transactions: number
          name: string
          quality_bonus: number
          referral_threshold: number
          social_posts_required: number
          tier: Database["public"]["Enums"]["app_tier"]
        }
        Insert: {
          base_earnings: number
          commission_rate: number
          created_at?: string
          id?: string
          level: number
          min_monthly_transactions?: number
          name: string
          quality_bonus: number
          referral_threshold: number
          social_posts_required?: number
          tier: Database["public"]["Enums"]["app_tier"]
        }
        Update: {
          base_earnings?: number
          commission_rate?: number
          created_at?: string
          id?: string
          level?: number
          min_monthly_transactions?: number
          name?: string
          quality_bonus?: number
          referral_threshold?: number
          social_posts_required?: number
          tier?: Database["public"]["Enums"]["app_tier"]
        }
        Relationships: []
      }
      transactions: {
        Row: {
          ambassador_id: string
          amount: number
          commission_amount: number
          commission_rate: number
          created_at: string
          id: string
          notes: string | null
          order_id: string | null
          qualifies_for_bonus: boolean
          referral_id: string | null
          stars_awarded: number
          status: Database["public"]["Enums"]["transaction_status"]
          tier_at_transaction: Database["public"]["Enums"]["app_tier"]
          transaction_date: string
        }
        Insert: {
          ambassador_id: string
          amount: number
          commission_amount: number
          commission_rate: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          qualifies_for_bonus?: boolean
          referral_id?: string | null
          stars_awarded?: number
          status?: Database["public"]["Enums"]["transaction_status"]
          tier_at_transaction: Database["public"]["Enums"]["app_tier"]
          transaction_date?: string
        }
        Update: {
          ambassador_id?: string
          amount?: number
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          qualifies_for_bonus?: boolean
          referral_id?: string | null
          stars_awarded?: number
          status?: Database["public"]["Enums"]["transaction_status"]
          tier_at_transaction?: Database["public"]["Enums"]["app_tier"]
          transaction_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
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
      calculate_tier: {
        Args: { referral_count: number }
        Returns: Database["public"]["Enums"]["app_tier"]
      }
      create_ambassador_as_admin: {
        Args: { approved_by?: string; referral_code: string; user_id: string }
        Returns: Json
      }
      create_profile_as_admin: {
        Args: {
          profile_email: string
          profile_id: string
          profile_name: string
        }
        Returns: Json
      }
      disconnect_ambassador_telegram: { Args: never; Returns: Json }
      generate_referral_code: { Args: never; Returns: string }
      has_role:
        | {
            Args: { check_user_id: string; role_name: string }
            Returns: boolean
          }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      update_ambassador_telegram_info: {
        Args: { p_telegram_id: string; p_telegram_username?: string }
        Returns: Json
      }
      update_application_as_admin: {
        Args: {
          application_id: string
          new_status: string
          rejection_reason?: string
          reviewed_by?: string
        }
        Returns: Json
      }
      update_first_login: { Args: { user_uuid: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "ambassador" | "pending"
      app_tier: "entry" | "growing" | "advanced" | "elite"
      message_priority: "low" | "normal" | "high" | "urgent"
      message_status:
        | "pending"
        | "sent"
        | "delivered"
        | "opened"
        | "clicked"
        | "failed"
        | "bounced"
      message_type:
        | "welcome"
        | "approval"
        | "rejection"
        | "login_credentials"
        | "password_reset"
        | "tier_upgrade"
        | "commission_payout"
        | "referral_activation"
        | "monthly_report"
        | "system_notification"
        | "manual_email"
        | "reminder"
        | "announcement"
      payout_status: "pending" | "processing" | "completed" | "failed"
      transaction_status: "pending" | "completed" | "cancelled" | "refunded"
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
      app_role: ["admin", "ambassador", "pending"],
      app_tier: ["entry", "growing", "advanced", "elite"],
      message_priority: ["low", "normal", "high", "urgent"],
      message_status: [
        "pending",
        "sent",
        "delivered",
        "opened",
        "clicked",
        "failed",
        "bounced",
      ],
      message_type: [
        "welcome",
        "approval",
        "rejection",
        "login_credentials",
        "password_reset",
        "tier_upgrade",
        "commission_payout",
        "referral_activation",
        "monthly_report",
        "system_notification",
        "manual_email",
        "reminder",
        "announcement",
      ],
      payout_status: ["pending", "processing", "completed", "failed"],
      transaction_status: ["pending", "completed", "cancelled", "refunded"],
    },
  },
} as const
