import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch.async";
import { productService } from "./product.service";
import { sendResponse } from "../../utils/send.response";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";

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

});

const product = catchAsync(async(req: Request,res:Response)=>{

    const result = await productService.getProductInDB();
   sendResponse(res, {
     success: true,
     statusCode: httpStatus.CREATED,
     message: "Found Products Successfully",
     data: result,
   });
});

const updateProduct = catchAsync(async(req:Request,res:Response)=>{

    const id = Number(req.params.id);
    const body =req.body;
    const user = req.user as JwtPayload;


const result = await productService.updateProductInDB(id,body,user);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Update Product Successfully",
      data: result,
    });
});


export const productController ={
    postProduct,
    postCategory,
    product,
    updateProduct
};