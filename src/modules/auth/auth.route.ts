import { Router } from "express";
import { authController } from "./auth.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const route = Router();

route.post("/login",authController.login);

route.post("/refresh-token",auth(Role.ADMIN,Role.CUSTOMER,Role.PROVIDER),authController.refreshTheToken);

route.post("/logout",authController.logout,);



export const authRoute = route;