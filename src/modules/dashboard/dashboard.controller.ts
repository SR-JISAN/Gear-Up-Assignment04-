import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch.async";
import { sendResponse } from "../../utils/send.response";
import { DashboardService } from "./dashboard.service";
import { JwtPayload } from "jsonwebtoken";


const adminDashboard = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardService.adminDashboard();

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Admin dashboard data fetched",
    data: result,
  });
});

const providerDashboard = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const result = await DashboardService.providerDashboard(user.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Provider dashboard data fetched",
    data: result,
  });
});

const customerDashboard = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const result = await DashboardService.customerDashboard(user.id);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Customer dashboard data fetched",
    data: result,
  });
});

export const DashboardController = {
  adminDashboard,
  providerDashboard,
  customerDashboard,
};
