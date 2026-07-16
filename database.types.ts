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
      analytics_events: {
        Row: {
          created_at: string | null
          duration: number | null
          event_type: string
          geo_city: string | null
          geo_country: string | null
          id: string
          metadata: Json | null
          path: string | null
          referrer: string | null
          session_id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          event_type: string
          geo_city?: string | null
          geo_country?: string | null
          id?: string
          metadata?: Json | null
          path?: string | null
          referrer?: string | null
          session_id: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          event_type?: string
          geo_city?: string | null
          geo_country?: string | null
          id?: string
          metadata?: Json | null
          path?: string | null
          referrer?: string | null
          session_id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          about_seo_description: string | null
          about_seo_title: string | null
          announcement_text: string | null
          blog_seo_description: string | null
          blog_seo_title: string | null
          business_hours: Json | null
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          core_values: string | null
          currency: string | null
          custom_head_scripts: string | null
          default_og_image: string | null
          enable_categories_section: boolean | null
          enable_commitment_section: boolean | null
          enable_community_section: boolean | null
          enable_contact_form: boolean | null
          enable_email_admin_new_order: boolean | null
          enable_email_contact_admin: boolean | null
          enable_email_new_order: boolean | null
          enable_email_notifications: boolean | null
          enable_email_order_shipped: boolean | null
          enable_email_welcome: boolean | null
          enable_featured_products: boolean | null
          enable_journal_section: boolean | null
          enable_newsletter_signup: boolean | null
          enable_reviews: boolean | null
          enable_social_section: boolean | null
          featured_categories: Json | null
          founder_bio: string | null
          founder_image: string | null
          founder_name: string | null
          founder_quote: string | null
          free_shipping_threshold: number | null
          gemini_api_key: string | null
          opencode_api_key: string | null
          google_analytics_id: string | null
          hero_banner_image: string | null
          hero_banner_text: string | null
          id: number
          is_announcement_enabled: boolean | null
          logo_image: string | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          mission: string | null
          payment_gateway_enabled: boolean | null
          paypal_client_id: string | null
          paypal_mode: string | null
          paypal_secret_key: string | null
          paypal_webhook_id: string | null
          priority_pages: Json | null
          privacy_policy: string | null
          require_login_for_checkout: boolean | null
          resend_api_key: string | null
          resend_from_email: string | null
          return_policy: string | null
          secondary_slogan: string | null
          sender_email: string | null
          seo_content_col1_body: string | null
          seo_content_col1_title: string | null
          seo_content_col2_body: string | null
          seo_content_col2_title: string | null
          seo_content_intro: string | null
          seo_content_title: string | null
          seo_description: string | null
          seo_title: string | null
          shipping_policy: string | null
          shop_seo_description: string | null
          shop_seo_title: string | null
          slogan: string | null
          social_links: Json | null
          social_section_body: string | null
          social_section_title: string | null
          support_email: string | null
          tax_rate: number | null
          terms_conditions: string | null
          vision: string | null
        }
        Insert: {
          about_seo_description?: string | null
          about_seo_title?: string | null
          announcement_text?: string | null
          blog_seo_description?: string | null
          blog_seo_title?: string | null
          business_hours?: Json | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          core_values?: string | null
          currency?: string | null
          custom_head_scripts?: string | null
          default_og_image?: string | null
          enable_categories_section?: boolean | null
          enable_commitment_section?: boolean | null
          enable_community_section?: boolean | null
          enable_contact_form?: boolean | null
          enable_email_admin_new_order?: boolean | null
          enable_email_contact_admin?: boolean | null
          enable_email_new_order?: boolean | null
          enable_email_notifications?: boolean | null
          enable_email_order_shipped?: boolean | null
          enable_email_welcome?: boolean | null
          enable_featured_products?: boolean | null
          enable_journal_section?: boolean | null
          enable_newsletter_signup?: boolean | null
          enable_reviews?: boolean | null
          enable_social_section?: boolean | null
          featured_categories?: Json | null
          founder_bio?: string | null
          founder_image?: string | null
          founder_name?: string | null
          founder_quote?: string | null
          free_shipping_threshold?: number | null
          gemini_api_key?: string | null
          google_analytics_id?: string | null
          hero_banner_image?: string | null
          hero_banner_text?: string | null
          id?: number
          is_announcement_enabled?: boolean | null
          logo_image?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          mission?: string | null
          payment_gateway_enabled?: boolean | null
          paypal_client_id?: string | null
          paypal_mode?: string | null
          paypal_secret_key?: string | null
          paypal_webhook_id?: string | null
          priority_pages?: Json | null
          privacy_policy?: string | null
          require_login_for_checkout?: boolean | null
          resend_api_key?: string | null
          resend_from_email?: string | null
          return_policy?: string | null
          secondary_slogan?: string | null
          sender_email?: string | null
          seo_content_col1_body?: string | null
          seo_content_col1_title?: string | null
          seo_content_col2_body?: string | null
          seo_content_col2_title?: string | null
          seo_content_intro?: string | null
          seo_content_title?: string | null
          seo_description?: string | null
          seo_title?: string | null
          shipping_policy?: string | null
          shop_seo_description?: string | null
          shop_seo_title?: string | null
          slogan?: string | null
          social_links?: Json | null
          social_section_body?: string | null
          social_section_title?: string | null
          support_email?: string | null
          tax_rate?: number | null
          terms_conditions?: string | null
          vision?: string | null
        }
        Update: {
          about_seo_description?: string | null
          about_seo_title?: string | null
          announcement_text?: string | null
          blog_seo_description?: string | null
          blog_seo_title?: string | null
          business_hours?: Json | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          core_values?: string | null
          currency?: string | null
          custom_head_scripts?: string | null
          default_og_image?: string | null
          enable_categories_section?: boolean | null
          enable_commitment_section?: boolean | null
          enable_community_section?: boolean | null
          enable_contact_form?: boolean | null
          enable_email_admin_new_order?: boolean | null
          enable_email_contact_admin?: boolean | null
          enable_email_new_order?: boolean | null
          enable_email_notifications?: boolean | null
          enable_email_order_shipped?: boolean | null
          enable_email_welcome?: boolean | null
          enable_featured_products?: boolean | null
          enable_journal_section?: boolean | null
          enable_newsletter_signup?: boolean | null
          enable_reviews?: boolean | null
          enable_social_section?: boolean | null
          featured_categories?: Json | null
          founder_bio?: string | null
          founder_image?: string | null
          founder_name?: string | null
          founder_quote?: string | null
          free_shipping_threshold?: number | null
          gemini_api_key?: string | null
          google_analytics_id?: string | null
          hero_banner_image?: string | null
          hero_banner_text?: string | null
          id?: number
          is_announcement_enabled?: boolean | null
          logo_image?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          mission?: string | null
          payment_gateway_enabled?: boolean | null
          paypal_client_id?: string | null
          paypal_mode?: string | null
          paypal_secret_key?: string | null
          paypal_webhook_id?: string | null
          priority_pages?: Json | null
          privacy_policy?: string | null
          require_login_for_checkout?: boolean | null
          resend_api_key?: string | null
          resend_from_email?: string | null
          return_policy?: string | null
          secondary_slogan?: string | null
          sender_email?: string | null
          seo_content_col1_body?: string | null
          seo_content_col1_title?: string | null
          seo_content_col2_body?: string | null
          seo_content_col2_title?: string | null
          seo_content_intro?: string | null
          seo_content_title?: string | null
          seo_description?: string | null
          seo_title?: string | null
          shipping_policy?: string | null
          shop_seo_description?: string | null
          shop_seo_title?: string | null
          slogan?: string | null
          social_links?: Json | null
          social_section_body?: string | null
          social_section_title?: string | null
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
      blog_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          post_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          post_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          canonical_url: string | null
          category_id: string | null
          content: string
          date: string | null
          featured_image: string | null
          hero_video: string | null
          id: string
          is_nofollow: boolean | null
          is_noindex: boolean | null
          keywords: string[] | null
          likes: number
          reading_time: number | null
          scheduled_for: string | null
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
          canonical_url?: string | null
          category_id?: string | null
          content: string
          date?: string | null
          featured_image?: string | null
          hero_video?: string | null
          id?: string
          is_nofollow?: boolean | null
          is_noindex?: boolean | null
          keywords?: string[] | null
          likes?: number
          reading_time?: number | null
          scheduled_for?: string | null
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
          canonical_url?: string | null
          category_id?: string | null
          content?: string
          date?: string | null
          featured_image?: string | null
          hero_video?: string | null
          id?: string
          is_nofollow?: boolean | null
          is_noindex?: boolean | null
          keywords?: string[] | null
          likes?: number
          reading_time?: number | null
          scheduled_for?: string | null
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
          canonical_url: string | null
          color: string
          is_noindex: boolean | null
          key: string
          label: string
          seo_description: string | null
          seo_title: string | null
        }
        Insert: {
          bg_class: string
          canonical_url?: string | null
          color: string
          is_noindex?: boolean | null
          key: string
          label: string
          seo_description?: string | null
          seo_title?: string | null
        }
        Update: {
          bg_class?: string
          canonical_url?: string | null
          color?: string
          is_noindex?: boolean | null
          key?: string
          label?: string
          seo_description?: string | null
          seo_title?: string | null
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
          customer_email: string | null
          customer_name: string | null
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
          return_reason: string | null
          return_requested_at: string | null
          return_status: string | null
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
          customer_email?: string | null
          customer_name?: string | null
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
          return_reason?: string | null
          return_requested_at?: string | null
          return_status?: string | null
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
          customer_email?: string | null
          customer_name?: string | null
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
          return_reason?: string | null
          return_requested_at?: string | null
          return_status?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total?: number
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
          canonical_url: string | null
          category_key: string | null
          colors: string[] | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_free_shipping: boolean | null
          is_nofollow: boolean | null
          is_noindex: boolean | null
          is_on_sale: boolean | null
          is_published: boolean | null
          keywords: string[] | null
          low_stock_threshold: number | null
          price: number
          review_count: number | null
          sale_price: number | null
          seo_description: string | null
          seo_title: string | null
          shipping_class: string | null
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
          canonical_url?: string | null
          category_key?: string | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_free_shipping?: boolean | null
          is_nofollow?: boolean | null
          is_noindex?: boolean | null
          is_on_sale?: boolean | null
          is_published?: boolean | null
          keywords?: string[] | null
          low_stock_threshold?: number | null
          price: number
          review_count?: number | null
          sale_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          shipping_class?: string | null
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
          canonical_url?: string | null
          category_key?: string | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_free_shipping?: boolean | null
          is_nofollow?: boolean | null
          is_noindex?: boolean | null
          is_on_sale?: boolean | null
          is_published?: boolean | null
          keywords?: string[] | null
          low_stock_threshold?: number | null
          price?: number
          review_count?: number | null
          sale_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          shipping_class?: string | null
          sizes?: string[] | null
          sku?: string | null
          slug?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          title?: string
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
      shipping_options: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          rate: number
          zone_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          rate?: number
          zone_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          rate?: number
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_options_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "shipping_zones"
            referencedColumns: ["id"]
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
      user_addresses: {
        Row: {
          address1: string
          address2: string | null
          city: string
          country: string
          created_at: string | null
          id: string
          is_default: boolean | null
          label: string
          phone: string | null
          postcode: string
          user_id: string
        }
        Insert: {
          address1: string
          address2?: string | null
          city: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          phone?: string | null
          postcode: string
          user_id: string
        }
        Update: {
          address1?: string
          address2?: string | null
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          phone?: string | null
          postcode?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
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
      public_app_settings: {
        Row: {
          about_seo_description: string | null
          about_seo_title: string | null
          announcement_text: string | null
          blog_seo_description: string | null
          blog_seo_title: string | null
          business_hours: Json | null
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          core_values: string | null
          currency: string | null
          custom_head_scripts: string | null
          default_og_image: string | null
          enable_categories_section: boolean | null
          enable_commitment_section: boolean | null
          enable_community_section: boolean | null
          enable_contact_form: boolean | null
          enable_email_admin_new_order: boolean | null
          enable_email_contact_admin: boolean | null
          enable_email_new_order: boolean | null
          enable_email_notifications: boolean | null
          enable_email_order_shipped: boolean | null
          enable_email_welcome: boolean | null
          enable_featured_products: boolean | null
          enable_journal_section: boolean | null
          enable_newsletter_signup: boolean | null
          enable_reviews: boolean | null
          enable_social_section: boolean | null
          featured_categories: Json | null
          founder_bio: string | null
          founder_image: string | null
          founder_name: string | null
          founder_quote: string | null
          free_shipping_threshold: number | null
          gemini_api_key: string | null
          opencode_api_key: string | null
          google_analytics_id: string | null
          hero_banner_image: string | null
          hero_banner_text: string | null
          id: number | null
          is_announcement_enabled: boolean | null
          logo_image: string | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          mission: string | null
          payment_gateway_enabled: boolean | null
          paypal_client_id: string | null
          paypal_mode: string | null
          privacy_policy: string | null
          require_login_for_checkout: boolean | null
          resend_from_email: string | null
          return_policy: string | null
          secondary_slogan: string | null
          seo_content_col1_body: string | null
          seo_content_col1_title: string | null
          seo_content_col2_body: string | null
          seo_content_col2_title: string | null
          seo_content_intro: string | null
          seo_content_title: string | null
          seo_description: string | null
          seo_title: string | null
          shipping_policy: string | null
          shop_seo_description: string | null
          shop_seo_title: string | null
          slogan: string | null
          social_links: Json | null
          social_section_body: string | null
          social_section_title: string | null
          support_email: string | null
          tax_rate: number | null
          terms_conditions: string | null
          vision: string | null
        }
        Insert: {
          about_seo_description?: string | null
          about_seo_title?: string | null
          announcement_text?: string | null
          blog_seo_description?: string | null
          blog_seo_title?: string | null
          business_hours?: Json | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          core_values?: string | null
          currency?: string | null
          custom_head_scripts?: string | null
          default_og_image?: string | null
          enable_categories_section?: boolean | null
          enable_commitment_section?: boolean | null
          enable_community_section?: boolean | null
          enable_contact_form?: boolean | null
          enable_email_admin_new_order?: boolean | null
          enable_email_contact_admin?: boolean | null
          enable_email_new_order?: boolean | null
          enable_email_notifications?: boolean | null
          enable_email_order_shipped?: boolean | null
          enable_email_welcome?: boolean | null
          enable_featured_products?: boolean | null
          enable_journal_section?: boolean | null
          enable_newsletter_signup?: boolean | null
          enable_reviews?: boolean | null
          enable_social_section?: boolean | null
          featured_categories?: Json | null
          founder_bio?: string | null
          founder_image?: string | null
          founder_name?: string | null
          founder_quote?: string | null
          free_shipping_threshold?: number | null
          gemini_api_key?: string | null
          google_analytics_id?: string | null
          hero_banner_image?: string | null
          hero_banner_text?: string | null
          id?: number | null
          is_announcement_enabled?: boolean | null
          logo_image?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          mission?: string | null
          payment_gateway_enabled?: boolean | null
          paypal_client_id?: string | null
          paypal_mode?: string | null
          privacy_policy?: string | null
          require_login_for_checkout?: boolean | null
          resend_from_email?: string | null
          return_policy?: string | null
          secondary_slogan?: string | null
          seo_content_col1_body?: string | null
          seo_content_col1_title?: string | null
          seo_content_col2_body?: string | null
          seo_content_col2_title?: string | null
          seo_content_intro?: string | null
          seo_content_title?: string | null
          seo_description?: string | null
          seo_title?: string | null
          shipping_policy?: string | null
          shop_seo_description?: string | null
          shop_seo_title?: string | null
          slogan?: string | null
          social_links?: Json | null
          social_section_body?: string | null
          social_section_title?: string | null
          support_email?: string | null
          tax_rate?: number | null
          terms_conditions?: string | null
          vision?: string | null
        }
        Update: {
          about_seo_description?: string | null
          about_seo_title?: string | null
          announcement_text?: string | null
          blog_seo_description?: string | null
          blog_seo_title?: string | null
          business_hours?: Json | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          core_values?: string | null
          currency?: string | null
          custom_head_scripts?: string | null
          default_og_image?: string | null
          enable_categories_section?: boolean | null
          enable_commitment_section?: boolean | null
          enable_community_section?: boolean | null
          enable_contact_form?: boolean | null
          enable_email_admin_new_order?: boolean | null
          enable_email_contact_admin?: boolean | null
          enable_email_new_order?: boolean | null
          enable_email_notifications?: boolean | null
          enable_email_order_shipped?: boolean | null
          enable_email_welcome?: boolean | null
          enable_featured_products?: boolean | null
          enable_journal_section?: boolean | null
          enable_newsletter_signup?: boolean | null
          enable_reviews?: boolean | null
          enable_social_section?: boolean | null
          featured_categories?: Json | null
          founder_bio?: string | null
          founder_image?: string | null
          founder_name?: string | null
          founder_quote?: string | null
          free_shipping_threshold?: number | null
          gemini_api_key?: string | null
          google_analytics_id?: string | null
          hero_banner_image?: string | null
          hero_banner_text?: string | null
          id?: number | null
          is_announcement_enabled?: boolean | null
          logo_image?: string | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          mission?: string | null
          payment_gateway_enabled?: boolean | null
          paypal_client_id?: string | null
          paypal_mode?: string | null
          privacy_policy?: string | null
          require_login_for_checkout?: boolean | null
          resend_from_email?: string | null
          return_policy?: string | null
          secondary_slogan?: string | null
          seo_content_col1_body?: string | null
          seo_content_col1_title?: string | null
          seo_content_col2_body?: string | null
          seo_content_col2_title?: string | null
          seo_content_intro?: string | null
          seo_content_title?: string | null
          seo_description?: string | null
          seo_title?: string | null
          shipping_policy?: string | null
          shop_seo_description?: string | null
          shop_seo_title?: string | null
          slogan?: string | null
          social_links?: Json | null
          social_section_body?: string | null
          social_section_title?: string | null
          support_email?: string | null
          tax_rate?: number | null
          terms_conditions?: string | null
          vision?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      anonymize_and_delete_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      calculate_cart_totals: {
        Args: {
          p_discount_code?: string
          p_items: Json
          p_shipping_address: Json
        }
        Returns: Json
      }
      cancel_and_restore_stock: {
        Args: { p_order_id: string; p_user_id: string }
        Returns: Json
      }
      check_is_admin: { Args: { user_id: string }; Returns: boolean }
      create_order_secure: {
        Args: {
          p_customer_email?: string
          p_customer_name?: string
          p_discount_code?: string
          p_items: Json
          p_notes?: string
          p_payment_intent_id?: string
          p_payment_status?: string
          p_shipping_address: Json
          p_user_id: string
        }
        Returns: Json
      }
      finalize_order_payment: {
        Args: { p_order_id: string; p_payment_intent_id: string }
        Returns: undefined
      }
      generate_order_number: { Args: never; Returns: string }
      get_admin_payments_paginated: {
        Args: {
          p_method?: string
          p_page: number
          p_page_size: number
          p_status?: string
        }
        Returns: Json
      }
      get_admin_stats: { Args: never; Returns: Json }
      get_analytics_overview: {
        Args: { time_range_end: string; time_range_start: string }
        Returns: Json
      }
      get_daily_analytics: { Args: { days_lookback?: number }; Returns: Json }
      get_geo_stats: { Args: { days_lookback?: number }; Returns: Json }
      get_live_visitors: { Args: { lookback_minutes?: number }; Returns: Json }
      get_orders_paginated: {
        Args: { page_num?: number; page_size?: number; status_filter?: string }
        Returns: Json
      }
      get_product_analytics: {
        Args: { days_lookback?: number; limit_count?: number }
        Returns: Json
      }
      get_product_sales_stats: { Args: { p_product_id: string }; Returns: Json }
      get_products_paginated: {
        Args: {
          p_category_key?: string
          p_max_price?: number
          p_min_price?: number
          p_page: number
          p_page_size: number
          p_search_query?: string
          p_sort_by?: string
        }
        Returns: Json
      }
      get_public_payment_settings: { Args: never; Returns: Json }
      get_public_site_settings: { Args: never; Returns: Json }
      get_public_user_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          bio: string
          id: string
          name: string
        }[]
      }
      get_traffic_sources: { Args: { days_lookback?: number }; Returns: Json }
      get_users_paginated: {
        Args: { page_num?: number; page_size?: number; search_term?: string }
        Returns: Json
      }
      increment_blog_like: { Args: { post_id_to_inc: string }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      trigger_send_email: {
        Args: { body: string; recipient: string; subject: string }
        Returns: undefined
      }
      update_order_payment_status: {
        Args: {
          p_order_id: string
          p_payment_intent_id: string
          p_payment_status: string
        }
        Returns: Json
      }
      validate_discount_code: {
        Args: { code_input: string; order_total: number }
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
  public: {
    Enums: {},
  },
} as const
