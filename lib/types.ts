// lib/types.ts
export type Product = {
  id: string;
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  sizes?: string[];
  colors?: string[];
  fabric?: string;
  quantity?: number;
  product_details?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
};

// Use this for cards/grids (subset only)
export type ProductLite = Pick<
  Product,
  '_id' | 'name' | 'slug' | 'price' | 'images' | 'colors' | 'sizes'
>;
