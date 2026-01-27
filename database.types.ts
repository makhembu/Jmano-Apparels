
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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          announcement_text: string | null
          business_hours: Json | null
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          core_values: string | null
          currency: string | null
          email_provider: string | null
          enable_email_new_order: boolean | null
          enable_email_notifications: boolean | null
          enable_email_order_shipped: boolean | null
          enable_email_welcome: boolean | null
          featured_categories: Json | null
          founder_name: string | null
          founder_bio: string | null
          founder_image: string | null
          founder_quote: string | null
          free_shipping_threshold: number | null
          hero_banner_image: string | null
          hero_banner_text: string | null
          id: number
          is_announcement_enabled: boolean | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          mission: string | null
          privacy_policy: string | null
          return_policy: string | null
          secondary_slogan: string | null
          shipping_policy: string | null
          slogan: string | null
          smtp_settings: Json | null
          social_links: Json | null
          support_email: string | null
          tax_rate: number | null
          terms_conditions: string | null
          vision: string | null
        }
        Insert: {
          announcement_text?: string | null
          business_hours?: Json | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          core_values?: string | null
          currency?: string | null
          email_provider?: string | null
          enable_email_new_order?: boolean | null
          enable_email_notifications?: boolean | null
          enable_email_order_shipped?: boolean | null
          enable_email_welcome?: boolean | null
          featured_categories?: Json | null
          founder_name?: string | null
          founder_bio?: string | null
          founder_image?: string | null
          founder_quote?: string | null
          free_shipping_threshold?: number | null
          hero_banner_image?: string | null
          hero_banner_text?: string | null
          id?: number
          is_announcement_enabled?: boolean | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          mission?: string | null
          privacy_policy?: string | null
          return_policy?: string | null
          secondary_slogan?: string | null
          shipping_policy?: string | null
          slogan?: string | null
          smtp_settings?: Json | null
          social_links?: Json | null
          support_email?: string | null
          tax_rate?: number | null
          terms_conditions?: string | null
          vision?: string | null
        }
        Update: {
          announcement_text?: string | null
          business_hours?: Json | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          core_values?: string | null
          currency?: string | null
          email_provider?: string | null
          enable_email_new_order?: boolean | null
          enable_email_notifications?: boolean | null
          enable_email_order_shipped?: boolean | null
          enable_email_welcome?: boolean | null
          featured_categories?: Json | null
          founder_name?: string | null
          founder_bio?: string | null
          founder_image?: string | null
          founder_quote?: string | null
          free_shipping_threshold?: number | null
          hero_banner_image?: string | null
          hero_banner_text?: string | null
          id?: number
          is_announcement_enabled?: boolean | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          mission?: string | null
          privacy_policy?: string | null
          return_policy?: string | null
          secondary_slogan?: string | null
          shipping_policy?: string | null
          slogan?: string | null
          smtp_settings?: Json | null
          social_links?: Json | null
          support_email?: string | null
          tax_rate?: number | null
          terms_conditions?: string | null
          vision?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          blog_post_id: string
          tag_id: string
        }
        Insert: {
          blog_post_id: string
          tag_id: string
        }
        Update: {
          blog_post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string | null
          category_id: string | null
          content: string
          date: string | null
          featured_image: string | null
          id: string
          reading_time: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          status: string | null
          summary: string | null
          thumbnail: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author?: string | null
          category_id?: string | null
          content: string
          date?: string | null
          featured_image?: string | null
          id?: string
          reading_time?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: string | null
          summary?: string | null
          thumbnail?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author?: string | null
          category_id?: string | null
          content?: string
          date?: string | null
          featured_image?: string | null
          id?: string
          reading_time?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          status?: string | null
          summary?: string | null
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          added_at: string | null
          id: string
          product_id: string | null
          quantity: number
          selected_color: string | null
          selected_size: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          product_id?: string | null
          quantity: number
          selected_color?: string | null
          selected_size?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          selected_color?: string | null
          selected_size?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          bg_class: string
          color: string
          key: string
          label: string
        }
        Insert: {
          bg_class: string
          color: string
          key: string
          label: string
        }
        Update: {
          bg_class?: string
          color?: string
          key?: string
          label?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          phone: string | null
          replied_at: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          phone?: string | null
          replied_at?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          phone?: string | null
          replied_at?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          applicable_categories: string[] | null
          code: string
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          minimum_purchase: number | null
          times_used: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_categories?: string[] | null
          code: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_purchase?: number | null
          times_used?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_categories?: string[] | null
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          minimum_purchase?: number | null
          times_used?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          created_at: string
          description: string | null
          id: string
          name: string
          subject: string
        }
        Insert: {
          body_html: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          subject: string
        }
        Update: {
          body_html?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_subscribed: boolean | null
          name: string | null
          source: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_subscribed?: boolean | null
          name?: string | null
          source?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_subscribed?: boolean | null
          name?: string | null
          source?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          cancelled_at: string | null
          date: string | null
          delivered_at: string | null
          discount_amount: number | null
          discount_code: string | null
          id: string
          notes: string | null
          order_number: string | null
          payment_intent_id: string | null
          payment_method: string | null
          payment_status: string | null
          products: Json
          refunded_at: string | null
          shipped_at: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          total: number
          tracking_number: string | null
          user_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          date?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          products: Json
          refunded_at?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total: number
          tracking_number?: string | null
          user_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          date?: string | null
          delivered_at?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          products?: Json
          refunded_at?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total: number
          tracking_number?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          product_id: string | null
          rating: number | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          product_id?: string | null
          rating?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          product_id?: string | null
          rating?: number | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          average_rating: number | null
          category_key: string | null
          colors: string[] | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_on_sale: boolean | null
          is_published: boolean | null
          low_stock_threshold: number | null
          price: number
          review_count: number | null
          sale_price: number | null
          seo_description: string | null
          seo_title: string | null
          sizes: string[] | null
          sku: string | null
          slug: string | null
          stock_quantity: number | null
          tags: string[] | null
          title: string
          total_sales: number | null
          weight: number | null
        }
        Insert: {
          average_rating?: number | null
          category_key?: string | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_on_sale?: boolean | null
          is_published?: boolean | null
          low_stock_threshold?: number | null
          price: number
          review_count?: number | null
          sale_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          sizes?: string[] | null
          sku?: string | null
          slug?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          title: string
          total_sales?: number | null
          weight?: number | null
        }
        Update: {
          average_rating?: number | null
          category_key?: string | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_on_sale?: boolean | null
          is_published?: boolean | null
          low_stock_threshold?: number | null
          price?: number
          review_count?: number | null
          sale_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          sizes?: string[] | null
          sku?: string | null
          slug?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          title: string
          total_sales?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_key_fkey"
            columns: ["category_key"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["key"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          base_rate: number
          countries: string[]
          estimated_days: string | null
          free_shipping_threshold: number | null
          id: string
          is_active: boolean | null
          name: string
          per_kg_rate: number | null
        }
        Insert: {
          base_rate: number
          countries: string[]
          estimated_days?: string | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          per_kg_rate?: number | null
        }
        Update: {
          base_rate?: number
          countries?: string[]
          estimated_days?: string | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          per_kg_rate?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string | null
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          added_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      create_order_secure: {
        Args: {
          p_user_id: string
          p_items: Json
          p_shipping_address: Json
          p_discount_code?: string | null
          p_notes?: string | null
        }
        Returns: Json
      }
      decrement_stock: {
        Args: {
          row_id: string
          quantity: number
        }
        Returns: undefined
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_products_paginated: {
        Args: {
          p_page: number
          p_page_size: number
          p_category_key?: string | null
          p_search_query?: string | null
          p_min_price?: number | null
          p_max_price?: number | null
          p_sort_by?: string | null
        }
        Returns: Json
      }
      get_public_payment_settings: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      handle_default_address: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_discount_code: {
        Args: {
          code_input: string
          order_total: number
        }
        Returns: Json
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const