import express, { Router } from "express";
import { paymentsController } from "./payment.controller";
import { Role } from "../../../generated/prisma/enums";
import auth from "../../middleware/auth";


const route = Router();

route.post("/checkout",auth(Role.CUSTOMER), paymentsController.createCheckout);
route.post("/webhook",paymentsController.stripeWebhook);

route.get("/histories/:id",auth(Role.ADMIN,Role.CUSTOMER),paymentsController.singlePaymentsHistory);
route.get("/history",auth(Role.ADMIN,Role.CUSTOMER),paymentsController.paymentsHistory);

export const paymentsRoute = route;