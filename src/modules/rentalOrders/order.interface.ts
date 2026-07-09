import { order_status } from "../../../generated/prisma/enums";

export interface IRentalItem {
  productId: number;
  quantity: number;
  startDate: Date;
  endDate: Date;
}

export interface IRentalOrder {
  pickUpAddress: string;
  items: IRentalItem[];
}

export interface IRentalItemData {
  productId: number;
  quantity: number;
  pricePerDay: number;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  subTotal: number;
}

export interface IUpdateOrder {
  orderStatus?: order_status;
  pickupDate?: string;
  returnDate?: string;
  pickUpAddress?: string;
}