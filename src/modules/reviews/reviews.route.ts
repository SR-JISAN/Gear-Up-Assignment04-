import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { reviewsController } from "./reviews.controller";

const route =Router();

route.post("/create",auth(Role.CUSTOMER),reviewsController.createReviews);


export const reviewsRoute =route;