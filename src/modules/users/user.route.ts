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

route.get("/all-users",auth(Role.ADMIN), userController.getallUsers);

route.patch("/update-profile",auth(Role.ADMIN,Role.CUSTOMER,Role.PROVIDER),userController.updateProfile);

route.patch("/:id/role-status",auth(Role.ADMIN), userController.updateUserRoleStatus);

export const  userRoute = route