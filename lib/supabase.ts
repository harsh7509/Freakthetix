import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  sizes: string[];
  colors: string[];
  fabric: string;
  quantity: number;
  product_details: string;
  images: string[];
  slug: string;
  created_at: string;
  updated_at: string;
};
