import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { orderController } from "./order.controller";

const route =Router();

route.post("/rentals",auth(Role.CUSTOMER), orderController.rentalOrder);

route.patch("/update/:id",auth(Role.ADMIN,Role.CUSTOMER,Role.PROVIDER), orderController.updateOrder);

route.get("/all",auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN),orderController.getOrders);

export const orderRoute = route
