export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "customer" | "admin";
export type OrderStatus =
  | "pending_payment"
  | "cod_confirmed"
  | "confirmed"
  | "dispatched"
  | "delivered"
  | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "razorpay" | "cod";
export type EnquiryType = "corporate" | "newsletter" | "support";
export type EnquiryStatus = "new" | "in_progress" | "closed";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string | null;
          email: string | null;
          full_name: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          phone?: string | null;
          email?: string | null;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string | null;
          email?: string | null;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          image_url: string | null;
          sort_order: number;
          published: boolean;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          subtitle?: string | null;
          image_url?: string | null;
          sort_order?: number;
          published?: boolean;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          subtitle?: string | null;
          image_url?: string | null;
          sort_order?: number;
          published?: boolean;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          long_description: string | null;
          category_id: string | null;
          spice_note: string | null;
          dietary: string[] | null;
          badge: string | null;
          tagline: string | null;
          rating: number | null;
          review_count: number | null;
          seo_title: string | null;
          seo_description: string | null;
          featured: boolean;
          bestseller: boolean;
          new_arrival: boolean;
          origin: string | null;
          shelf_life: string | null;
          ingredients: string[] | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string;
          long_description?: string | null;
          category_id?: string | null;
          spice_note?: string | null;
          dietary?: string[] | null;
          badge?: string | null;
          tagline?: string | null;
          rating?: number | null;
          review_count?: number | null;
          seo_title?: string | null;
          seo_description?: string | null;
          featured?: boolean;
          bestseller?: boolean;
          new_arrival?: boolean;
          origin?: string | null;
          shelf_life?: string | null;
          ingredients?: string[] | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          long_description?: string | null;
          category_id?: string | null;
          spice_note?: string | null;
          dietary?: string[] | null;
          badge?: string | null;
          tagline?: string | null;
          rating?: number | null;
          review_count?: number | null;
          seo_title?: string | null;
          seo_description?: string | null;
          featured?: boolean;
          bestseller?: boolean;
          new_arrival?: boolean;
          origin?: string | null;
          shelf_life?: string | null;
          ingredients?: string[] | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          label: string;
          sku: string;
          price_paise: number;
          mrp_paise: number | null;
          weight_g: number | null;
          stock_qty: number;
          low_stock_threshold: number;
          available: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          label: string;
          sku: string;
          price_paise: number;
          mrp_paise?: number | null;
          weight_g?: number | null;
          stock_qty?: number;
          low_stock_threshold?: number;
          available?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          label?: string;
          sku?: string;
          price_paise?: number;
          mrp_paise?: number | null;
          weight_g?: number | null;
          stock_qty?: number;
          low_stock_threshold?: number;
          available?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          alt: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          alt?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          alt?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      carts: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          variant_id: string;
          qty: number;
        };
        Insert: {
          id?: string;
          cart_id: string;
          variant_id: string;
          qty: number;
        };
        Update: {
          id?: string;
          cart_id?: string;
          variant_id?: string;
          qty?: number;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          line1: string;
          line2: string | null;
          city: string;
          state: string;
          pincode: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          line1: string;
          line2?: string | null;
          city: string;
          state: string;
          pincode: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          line1?: string;
          line2?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      shipping_zones: {
        Row: {
          id: string;
          name: string;
          rules: Json;
          active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          rules?: Json;
          active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          rules?: Json;
          active?: boolean;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          status: OrderStatus;
          payment_method: PaymentMethod;
          payment_status: PaymentStatus;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          subtotal_paise: number;
          shipping_paise: number;
          total_paise: number;
          address_snapshot: Json;
          customer_email: string | null;
          customer_phone: string | null;
          notes: string | null;
          courier_name: string | null;
          awb_code: string | null;
          shipment_id: string | null;
          tracking_url: string | null;
          shipping_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          status?: OrderStatus;
          payment_method: PaymentMethod;
          payment_status?: PaymentStatus;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          subtotal_paise: number;
          shipping_paise?: number;
          total_paise: number;
          address_snapshot: Json;
          customer_email?: string | null;
          customer_phone?: string | null;
          notes?: string | null;
          courier_name?: string | null;
          awb_code?: string | null;
          shipment_id?: string | null;
          tracking_url?: string | null;
          shipping_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          status?: OrderStatus;
          payment_method?: PaymentMethod;
          payment_status?: PaymentStatus;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          subtotal_paise?: number;
          shipping_paise?: number;
          total_paise?: number;
          address_snapshot?: Json;
          customer_email?: string | null;
          customer_phone?: string | null;
          notes?: string | null;
          courier_name?: string | null;
          awb_code?: string | null;
          shipment_id?: string | null;
          tracking_url?: string | null;
          shipping_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          variant_id: string | null;
          qty: number;
          unit_price_paise: number;
          name_snapshot: string;
          sku_snapshot: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          variant_id?: string | null;
          qty: number;
          unit_price_paise: number;
          name_snapshot: string;
          sku_snapshot?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          variant_id?: string | null;
          qty?: number;
          unit_price_paise?: number;
          name_snapshot?: string;
          sku_snapshot?: string | null;
        };
        Relationships: [];
      };
      inventory_logs: {
        Row: {
          id: string;
          variant_id: string;
          delta: number;
          reason: string;
          order_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          delta: number;
          reason: string;
          order_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          delta?: number;
          reason?: string;
          order_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      enquiries: {
        Row: {
          id: string;
          type: EnquiryType;
          payload: Json;
          status: EnquiryStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: EnquiryType;
          payload?: Json;
          status?: EnquiryStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: EnquiryType;
          payload?: Json;
          status?: EnquiryStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      content_blocks: {
        Row: {
          id: string;
          page_key: string;
          section_key: string;
          content: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_key: string;
          section_key: string;
          content?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_key?: string;
          section_key?: string;
          content?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      outlets: {
        Row: {
          id: string;
          name: string;
          address: string;
          lat: number | null;
          lng: number | null;
          hours: string | null;
          phone: string | null;
          sort_order: number;
          published: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          lat?: number | null;
          lng?: number | null;
          hours?: string | null;
          phone?: string | null;
          sort_order?: number;
          published?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          lat?: number | null;
          lng?: number | null;
          hours?: string | null;
          phone?: string | null;
          sort_order?: number;
          published?: boolean;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          storage_path: string;
          alt: string | null;
          folder: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          storage_path: string;
          alt?: string | null;
          folder?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          storage_path?: string;
          alt?: string | null;
          folder?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      combos: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          image_url: string | null;
          sku: string | null;
          price_paise: number;
          mrp_paise: number | null;
          featured: boolean;
          published: boolean;
          starts_at: string | null;
          ends_at: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          sku?: string | null;
          price_paise: number;
          mrp_paise?: number | null;
          featured?: boolean;
          published?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          sku?: string | null;
          price_paise?: number;
          mrp_paise?: number | null;
          featured?: boolean;
          published?: boolean;
          starts_at?: string | null;
          ends_at?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      combo_items: {
        Row: {
          id: string;
          combo_id: string;
          product_id: string | null;
          variant_id: string | null;
          qty: number;
          sort_order: number;
        };
        Insert: {
          id?: string;
          combo_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          qty?: number;
          sort_order?: number;
        };
        Update: {
          id?: string;
          combo_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          qty?: number;
          sort_order?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      enquiry_type: EnquiryType;
      enquiry_status: EnquiryStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
