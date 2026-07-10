import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch.async";
import { sendResponse } from "../../utils/send.response";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { ReviewsService } from "./reviews.service";


const createReviews =catchAsync(async(req:Request,res:Response)=>{
    const user =req.user as JwtPayload;
    const payload = req.body
    const result =await ReviewsService.createReviewInDB(user,payload)
   sendResponse(res,{
    success: true,
    statusCode: httpStatus.CREATED,
    message:"Reviews create successfully",
    data:result
   })
});

export const reviewsController ={
    createReviews
}