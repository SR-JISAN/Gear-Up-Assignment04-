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
