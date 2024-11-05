declare namespace UserProfile {
  interface ProfileData {
    profile: Profile;
    orders: Order[] | null;
  }

  type Profile = Database['public']['Tables']['users']['Row'];

  type Order = Database['public']['Tables']['orders']['Row'];

  type Cart = Database['public']['Tables']['carts']['Row'];

  type UserInsetProps = Database['public']['Tables']['users']['Insert'];

  type UserUpdateProps = Database['public']['Tables']['users']['Update'];

  interface Database {
    public: {
      Tables: {
        carts: {
          Row: {
            cart: FakeCart | null;
            created_at: string;
            user: number;
          };
          Insert: {
            cart?: Json | null;
            created_at?: string;
            user: number;
          };
          Update: {
            cart?: Json | null;
            created_at?: string;
            user?: number;
          };
          Relationships: [
            {
              foreignKeyName: 'public_carts_user_fkey';
              columns: ['user'];
              isOneToOne: true;
              referencedRelation: 'users';
              referencedColumns: ['id'];
            },
          ];
        };
        orders: {
          Row: {
            anonymous_id: string | null;
            cart: OrderItem[] | null;
            created_at: string;
            id: number | null;
            user: number | null;
          };
          Insert: {
            anonymous_id?: string | null;
            cart?: Json | null;
            created_at?: string;
            id?: number | null;
            user?: number | null;
          };
          Update: {
            anonymous_id?: string | null;
            cart?: Json | null;
            created_at?: string;
            id?: number | null;
            user?: number | null;
          };
          Relationships: [
            {
              foreignKeyName: 'orders_user_fkey';
              columns: ['user'];
              isOneToOne: false;
              referencedRelation: 'users';
              referencedColumns: ['id'];
            },
          ];
        };
        users: {
          Row: {
            created_at: string;
            email: string | null;
            id: number;
            name: string | null;
            segment_id: string | null;
          };
          Insert: {
            created_at?: string;
            email?: string | null;
            id?: number;
            name?: string | null;
            segment_id?: string | null;
          };
          Update: {
            created_at?: string;
            email?: string | null;
            id?: number;
            name?: string | null;
            segment_id?: string | null;
          };
          Relationships: [];
        };
      };
      Views: {
        [_ in never]: never;
      };
      Functions: {
        [_ in never]: never;
      };
      Enums: {
        [_ in never]: never;
      };
      CompositeTypes: {
        [_ in never]: never;
      };
    };
  }

  interface FakeCart {
    [productId: string]: { quantity: number; productKey: string };
  }

  interface OrderItem {
    product: {
      id: string;
      slug: string;
      key: string;
      name: string;
      description: string;
      price: number;
      categories: string[];
      rootCategories?: string[];
      subCategories?: string[];
      thumbnailId: string;
      images: {
        id: string;
        url: string;
      }[];
    };
    bundle: {
      id: string;
      logo: {
        id: string;
        url: string;
      }[];
      title: string;
      discount: number;
      description: string;
      products: OrderItem['product'][];
    };
    quantity: number;
  }
}
