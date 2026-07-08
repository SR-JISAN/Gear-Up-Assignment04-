import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { orderController } from "./order.controller";

const route =Router();

route.post("/rentals",auth(Role.CUSTOMER), orderController.rentalOrder);

export const orderRoute = route
