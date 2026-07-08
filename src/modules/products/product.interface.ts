export interface IProduct {
  title: string;
  details: string;
  brand: string;
  stock: string;
  price_per_day: number;
  categoryId: number;
  product_image?: string;
}

export interface ICategory {
  name: string;
}

export interface IUpdateProduct {
  title?: string;
  details?: string;
  brand?: string;
  stock?: string;
  price_per_day?: number;
  categoryId?: number;
  product_image?: string;
}