export type UserRole = 'customer' | 'admin' | 'vendor';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  created_at: string;
}

export type ProductCategory = 'tops' | 'dresses' | 'co-ords' | 'bottoms' | 'ethnic' | 'accessories';

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: ProductCategory;
  tags: string[];
  sizes: string[];
  colors: ColorOption[];
  images: string[];
  ai_avatar_image: string | null;
  stock_count: number;
  vendor_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  pinterest_inspired: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  size: string;
  color: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Vendor {
  id: string;
  shop_name: string;
  gst_number: string | null;
  bank_details: {
    account_number?: string;
    ifsc_code?: string;
    bank_name?: string;
    holder_name?: string;
  };
  pincode_serviceable: string[];
  rating: number;
  total_orders_fulfilled: number;
  is_approved: boolean;
  created_at: string;
  user?: User;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderItem {
  product_id: string;
  name: string;
  size: string;
  color: string;
  qty: number;
  price: number;
  image?: string;
}

export interface Address {
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
  created_at?: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  status: OrderStatus;
  payment_id: string | null;
  payment_status: PaymentStatus;
  shipping_address: Address;
  vendor_id: string | null;
  tracking_number: string | null;
  created_at: string;
  user?: User;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  comment: string | null;
  images: string[];
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string | null;
  };
}
