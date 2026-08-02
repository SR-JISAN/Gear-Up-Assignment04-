import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { DashboardController } from "./dashboard.controller";


const router = Router();

router.get("/admin", auth(Role.ADMIN), DashboardController.adminDashboard);

router.get(
  "/provider",
  auth(Role.PROVIDER),
  DashboardController.providerDashboard,
);

router.get(
  "/customer",
  auth(Role.CUSTOMER),
  DashboardController.customerDashboard,
);

export const DashboardRoutes = router;
