import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { productController } from "./product.controller";

const route = Router();


route.post("/post",auth(Role.PROVIDER), productController.postProduct);


export const productRoute =route;