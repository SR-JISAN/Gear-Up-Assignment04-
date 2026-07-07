import { Request, Response } from "express"
import { catchAsync } from "../../utils/catch.async"
import { userService } from "./user.service";
import { sendResponse } from "../../utils/send.response";
import httpStatus  from "http-status";

const registerController = catchAsync(async(req:Request,res: Response)=>{
     const payload = req.body;
     const result = await userService.registerInDB(payload)
    sendResponse(res,{
        success : true,
        statusCode : httpStatus.CREATED,
        message : "User Registration Successful",
        data: result
    })
})



export const userController = {
    registerController
}