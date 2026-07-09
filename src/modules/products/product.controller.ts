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

    const result = await productService.getProductInDB(req.query);
   sendResponse(res, {
     success: true,
     statusCode: httpStatus.OK,
     message: "Found Products Successfully",
     data: result,
   });
});

const singleProduct =catchAsync(async(req:Request,res:Response)=>{
  const id = Number(req.params.id);
  const result = await productService.getSingleProduct(id);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Found Products Successfully",
    data: result,
  });
});

const getAllCategories =catchAsync(async(req:Request, res:Response)=>{
      
  const result = await productService.getCategoriesInDb();
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Found Categories Successfully",
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
      statusCode: httpStatus.OK,
      message: "Update Product Successfully",
      data: result,
    });
});


const deleteProduct = catchAsync(async(req:Request,res:Response)=>{

    const id = Number(req.params.id);
    const user = req.user as JwtPayload;


     await productService.deleteProductInDB(id,user);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "delete Product Successfully",
      data: null,
    });
});


export const productController ={
    postProduct,
    postCategory,
    product,
    singleProduct,
    updateProduct,
    deleteProduct,
    getAllCategories
};