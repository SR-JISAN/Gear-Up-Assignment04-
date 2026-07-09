import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch.async";
import { orderService } from "./order.service";
import { sendResponse } from "../../utils/send.response";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";

const rentalOrder =catchAsync(async(req:Request,res: Response)=>{
        const result = await orderService.rentalOrderInDB(req.body, req.user as JwtPayload);

        sendResponse(res, {
          success: true,
          statusCode: 201,
          message: "Rental order created successfully",
          data: result,
        });
});

const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const body = req.body;
  const user = req.user as JwtPayload;

  const result = await orderService.updateOrderInDB(id, body, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Update Product Successfully",
    data: result,
  });
});

const getOrders = catchAsync (async(req:Request,res:Response)=>{

  const user = req.user as JwtPayload

  const result = await orderService.getOrdersInDB(user);

  sendResponse(res,{
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Get All Orders",
    data: result
  });

});



export const orderController = {
    rentalOrder,
    updateOrder,
    getOrders
};