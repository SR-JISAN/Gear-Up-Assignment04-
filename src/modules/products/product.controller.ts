import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch.async";
import { productService } from "./product.service";
import { sendResponse } from "../../utils/send.response";
import httpStatus from "http-status";

const postProduct = catchAsync(async(req:Request,res:Response)=>{
     const providerId = req.user?.id as string;

     const result = await productService.postProductInDB(providerId ,req.body);

     sendResponse(res,{
        success : true,
        statusCode: httpStatus.CREATED,
        message: "Product Created Successfully",
        data: result
     })
  
});

const postCategory = catchAsync(async(req:Request,res:Response)=>{

    const result = await productService.postCategoryInDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Category Created Successfully",
      data: result,
    });

})


export const productController ={
    postProduct,
    postCategory
};