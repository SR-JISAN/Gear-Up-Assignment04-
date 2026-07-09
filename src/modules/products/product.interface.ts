import { product_availability } from "../../../generated/prisma/enums";

export interface IProduct {
  title: string;
  details: string;
  brand: string;
  stock: number;
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
  stock?: number;
  availability?: product_availability;
  price_per_day?: number;
  categoryId?: number;
  product_image?: string;
}