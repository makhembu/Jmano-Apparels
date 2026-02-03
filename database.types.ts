
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
      analytics_events: {
        Row: {
          id: number
          session_id: string
          user_id: string | null
          event_type: string
          path: string
          referrer: string | null
          source: string
          metadata: Json | null
          geo_country: string | null
          geo_city: string | null
          duration: number | null
          created_at: string
        }
        Insert: {
          id?: number
          session_id: string
          user_id?: string | null
          event_type: string
          path: string
          referrer?: string | null
          source: string
          metadata?: Json | null
          geo_country?: string | null
          geo_city?: string | null
          duration?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          session_id?: string
          user_id?: string | null
          event_type?: string
          path?: string
          referrer?: string | null
          source?: string
          metadata?: Json | null
          geo_country?: string | null
          geo_city?: string | null
          duration?: number | null
          created_at?: string
        }
        Relationships: []
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
          is_free_shipping: boolean | null
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
          canonical_url: string | null
          is_noindex: boolean | null
          is_nofollow: boolean | null
          keywords: string[] | null
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
          is_free_shipping?: boolean | null
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
          canonical_url?: string | null
          is_noindex?: boolean | null
          is_nofollow?: boolean | null
          keywords?: string[] | null
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
          is_free_shipping?: boolean | null
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
          canonical_url?: string | null
          is_noindex?: boolean | null
          is_nofollow?: boolean | null
          keywords?: string[] | null
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
          paypal_client_id: string | null
          paypal_secret_key: string | null
          paypal_mode: string | null
          payment_gateway_enabled: boolean | null
          enable_newsletter_signup: boolean | null
          enable_contact_form: boolean | null
          enable_reviews: boolean | null
          enable_email_admin_new_order: boolean | null
          enable_email_contact_admin: boolean | null
          seo_title: string | null
          seo_description: string | null
          default_og_image: string | null
          google_analytics_id: string | null
          custom_head_scripts: string | null
          shop_seo_title: string | null
          shop_seo_description: string | null
          blog_seo_title: string | null
          blog_seo_description: string | null
          about_seo_title: string | null
          about_seo_description: string | null
          gemini_api_key: string | null
          logo_image: string | null
        }
        Insert: {
          id?: number
          slogan?: string | null
          [key: string]: any
        }
        Update: {
          [key: string]: any
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
      categories: {
        Row: {
          bg_class: string
          color: string
          key: string
          label: string
          seo_title: string | null
          seo_description: string | null
          canonical_url: string | null
          is_noindex: boolean | null
        }
        Insert: {
          bg_class: string
          color: string
          key: string
          label: string
          seo_title?: string | null
          seo_description?: string | null
          canonical_url?: string | null
          is_noindex?: boolean | null
        }
        Update: {
          bg_class?: string
          color?: string
          key?: string
          label?: string
          seo_title?: string | null
          seo_description?: string | null
          canonical_url?: string | null
          is_noindex?: boolean | null
        }
        Relationships: []
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
          canonical_url: string | null
          is_noindex: boolean | null
          is_nofollow: boolean | null
          keywords: string[] | null
        }
        Insert: {
          [key: string]: any
        }
        Update: {
          [key: string]: any
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
      // NEW TABLES
      blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
        }
        Insert: { id?: string; name: string; slug: string; description?: string | null }
        Update: { id?: string; name?: string; slug?: string; description?: string | null }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          customer_name: string | null
          customer_email: string | null
          order_number: string
          products: Json
          total: number
          subtotal: number | null
          shipping_cost: number | null
          tax_amount: number | null
          discount_amount: number | null
          discount_code: string | null
          status: string
          date: string
          payment_status: string | null
          payment_intent_id: string | null
          tracking_number: string | null
          shipped_at: string | null
          delivered_at: string | null
          cancelled_at: string | null
          created_at: string
          shipping_address: Json | null
          notes: string | null
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          name: string | null
          source: string | null
          is_subscribed: boolean
          subscribed_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          message: string
          subject: string | null
          phone: string | null
          is_read: boolean
          created_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: []
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          body_html: string
          description: string | null
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: []
      }
      product_reviews: {
        Row: {
            id: string
            product_id: string
            user_id: string
            rating: number
            title: string
            comment: string
            verified_purchase: boolean
            created_at: string
            is_approved: boolean
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: []
      }
      shipping_zones: {
        Row: {
            id: string
            name: string
            countries: string[]
            base_rate: number
            per_kg_rate: number
            free_shipping_threshold: number
            estimated_days: string
            is_active: boolean
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: []
      }
      discount_codes: {
        Row: {
            id: string
            code: string
            discount_type: string
            discount_value: number
            description: string
            valid_from: string
            valid_until: string
            is_active: boolean
            applicable_categories: string[] | null
            minimum_purchase: number | null
            max_uses: number | null
            created_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: []
      }
      cart_items: {
        Row: {
            id: string
            user_id: string
            product_id: string
            quantity: number
            selected_size: string
            selected_color: string | null
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: []
      }
      user_addresses: {
        Row: {
            id: string
            user_id: string
            label: string
            address1: string
            address2: string | null
            city: string
            postcode: string
            country: string
            phone: string | null
            is_default: boolean
            created_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: []
      }
      wishlists: {
        Row: {
            id: string
            user_id: string
            product_id: string
            created_at: string
        }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
        Relationships: []
      }
    }
    Functions: {
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
    }
  }
}
