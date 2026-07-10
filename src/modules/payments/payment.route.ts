import { Router } from "express";
import { paymentsController } from "./payment.controller";
import { Role } from "../../../generated/prisma/enums";
import auth from "../../middleware/auth";


const route = Router();

route.post("/checkout/:orderId",auth(Role.CUSTOMER), paymentsController.createCheckout)

export const paymentsRoute = route;