import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { productController } from "./product.controller";

const route = Router();


route.post("/post",auth(Role.PROVIDER), productController.postProduct);

route.post("/category",auth(Role.ADMIN), productController.postCategory);

route.get("/", productController.product);

route.get("/single/:id", productController.singleProduct);

route.get("/categories",auth(Role.ADMIN), productController.getAllCategories);

route.patch("/update/:id",auth(Role.PROVIDER,Role.ADMIN), productController.updateProduct);

route.delete("/delete/:id",auth(Role.ADMIN,Role.PROVIDER),productController.deleteProduct);



export const productRoute =route;