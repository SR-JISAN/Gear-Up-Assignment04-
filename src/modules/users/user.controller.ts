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
});


const getProfile = catchAsync(async(req:Request, res:Response)=>{
     if (!req.user) {
       throw new Error("Unauthorized");
     }
    const profileData = await userService.getProfileInDB(req.user.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Profile retrieved successfully",
      data: profileData
    });
});

const updateProfile = catchAsync (async(req:Request, res: Response)=>{
   if(!req.user){
    throw new Error ("User Not Found")
   };

   const result = await userService.updateProfileInDB(req.user?.id as string,req.body);

   sendResponse(res,{
    success: true,
    statusCode: httpStatus.OK,
    message: "User Updated Successfully By Admin",
    data: result
   })

   
});

const updateUserRoleStatus =catchAsync (async (req:Request, res: Response)=>{
    const result = await userService.updateUserRoleInDB(req.params.id as string, req.body);

    sendResponse(res,{
        success : true,
        statusCode: httpStatus.OK,
        message: "User Role Updated Successfully",
        data: result
    })

});


export const userController = {
    registerController,
    getProfile,
    updateUserRoleStatus,
    updateProfile
}