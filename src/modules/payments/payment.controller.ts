import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch.async";
import { paymentsService } from "./payment.service";
import { sendResponse } from "../../utils/send.response";
import httpStatus from "http-status";

 const createCheckout = catchAsync(async(req:Request, res:Response)=>{
    const id = req.user?.id as string;
    const orderId = Number(req.body.orderId);
    const result = await paymentsService.createCheckoutInDB(id,orderId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Checkout session created successfully",
      data: result,
    });
 });


const stripeWebhook = catchAsync(async(req:Request, res:Response)=>{
      const event = req.body as Buffer;
      const signature = req.headers['stripe-signature']!;
      
      await paymentsService.stripeWebhookInDB(event,signature as string);

      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Webhook triggered successfully",
        data: ""
      });
      
});


 export const paymentsController = {
   createCheckout,
   stripeWebhook,
 };