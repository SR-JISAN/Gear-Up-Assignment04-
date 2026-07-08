import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const route = Router()

route.post("/register", userController.registerController)

route.get("/my-profile",
  auth(Role.CUSTOMER, Role.ADMIN, Role.PROVIDER),
  userController.getProfile,
);

route.patch("/:id/role",auth(Role.ADMIN), userController.updateUserRole);

export const  userRoute = route