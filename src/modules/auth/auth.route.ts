import { Router } from "express";
import { authController } from "./auth.controller";

const route = Router();

route.post("/login",authController.login);





export const authRoute = route;