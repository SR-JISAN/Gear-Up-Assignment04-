import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch.async";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/send.response";
import httpStatus from "http-status";


const login = catchAsync (async (req:Request, res: Response)=>{

    const payload =req.body;

    const {accessToken, refreshToken} = await authService.loginInDb(payload);

    res.cookie("accessToken",accessToken,
        {
            secure: true,
            httpOnly: true,
            sameSite : "none",
            maxAge : 1000 * 60*60 *24
        }
    );
    res.cookie("refreshToken",refreshToken,
        {
            secure: true,
            httpOnly: true,
            sameSite : "none",
            maxAge : 1000 * 60*60 *7
        }
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged in successfully",
      data: {
        accessToken,
        refreshToken,
      },
    });

    

});

export const authController ={
    login
}