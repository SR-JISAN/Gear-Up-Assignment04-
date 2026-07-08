import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch.async";
import { orderService } from "./order.service";
import { sendResponse } from "../../utils/send.response";
import { JwtPayload } from "jsonwebtoken";

const rentalOrder =catchAsync(async(req:Request,res: Response)=>{
        const result = await orderService.rentalOrderInDB(req.body, req.user as JwtPayload);

        sendResponse(res, {
          success: true,
          statusCode: 201,
          message: "Rental order created successfully",
          data: result,
        });
});


export const orderController = {
    rentalOrder
};