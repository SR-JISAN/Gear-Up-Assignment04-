import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { ICategory, IProduct, IUpdateProduct } from "./product.interface";
import { product_availability, Role } from "../../../generated/prisma/enums";
import AppError from "../../app/errors/AppError";
import httpStatus from "http-status";



const postProductInDB = async(id: string, payload: IProduct)=>{
    const {
      title,
      details,
      brand,
      stock,
      price_per_day,
      product_image,
      categoryId,
    } = payload;

    if(!title){
        throw new AppError(httpStatus.BAD_REQUEST, "Title is  required");
     };
    if(!details){
        throw new AppError(httpStatus.BAD_REQUEST, "Description is  required");
     };
    if(!brand){
        throw new AppError(httpStatus.BAD_REQUEST, "Brand is  required");
     };
    if(!stock){
        throw new AppError(httpStatus.BAD_REQUEST, "Stock is  required");
     };
    if(!price_per_day || price_per_day <= 0){
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "Price is  required & Price must be greater than 0",
        );
     };
    
    if(!categoryId){
        throw new AppError(httpStatus.BAD_REQUEST, "Category is  required");
     };
    
     const category = await prisma.category.findUnique({
        where:{
           id: categoryId
        }
     });

     if(!category){
        throw new AppError(httpStatus.NOT_FOUND, "Category not found");
     };

     const product = await prisma.product.create({
       data: {
         title,
         details,
         brand,
         stock,
         price_per_day,
         product_image,
         providerId: id,
         categoryId
       },
       include: {
        category: true,
       }
     });

     return product;
};


const postCategoryInDB =async(payload:ICategory)=>{
    const {name}= payload
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: payload.name,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      throw new AppError(httpStatus.CONFLICT, "Category already exists");
    }
     const result =await prisma.category.create({
        data:{name}
     });
     return result;
};


const getProductInDB = async (query: Record<string, any>) => {
  const { search, category, brand, availability, minPrice, maxPrice } = query;

  const where: any = {};

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (brand) {
    where.brand = {
      contains: brand,
      mode: "insensitive",
    };
  }

  if (availability) {
    where.availability = availability;
  }

  if (category) {
    where.category = {
      name: {
        equals: category,
        mode: "insensitive",
      },
    };
  }

  if (minPrice || maxPrice) {
    where.price_per_day = {};

    if (minPrice) {
      where.price_per_day.gte = Number(minPrice);
    }

    if (maxPrice) {
      where.price_per_day.lte = Number(maxPrice);
    }
  }

    const result = await prisma.product.findMany({
      where,
      include: {
        category: true,
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviews: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
            rating: true,
            comment: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  return result;
};

const getSingleProduct =async(id:number)=>{
  if(!id){
    throw new AppError(httpStatus.NOT_FOUND, "Product not Found");
  };
    const result  = await prisma.product.findUnique({
      where: {id:id}
    });

    return result;
}

const getCategoriesInDb = async()=>{

      const result = await prisma.category.findMany({
        orderBy: {
          created_at: "desc",
        },
      });

      return result;
};

const updateProductInDB =async(productId: number, payload: IUpdateProduct,user :JwtPayload)=>{
     const product = await prisma.product.findUnique({
       where: {
         id: productId,
       },
     });

     if (!product) {
       throw new AppError(httpStatus.NOT_FOUND, "Product not found");
     }

     if (user.role === Role.PROVIDER && product.providerId !== user.id) {
       throw new Error("You are not authorized to update this product");
     }

     const updateData = { ...payload };

     
     if (payload.stock !== undefined) {
       updateData.availability =
         payload.stock > 0
           ? product_availability.AVAILABLE
           : product_availability.OUT_OF_STOCK;
     }

     const result = await prisma.product.update({
       where: {
         id: productId,
       },
       data: updateData,
     });

     return result;

};

const deleteProductInDB =async(productId: number, user :JwtPayload)=>{
   const product = await prisma.product.findUnique({
    where: {id:productId}
   });

   if(!product){
    throw new AppError(httpStatus.NOT_FOUND, "Product Not Found");
   };

   if(user.role === Role.PROVIDER && product.providerId !== user.id){
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this product",
    );
   };

   const result =await prisma.product.delete({
    where:{id:productId} 
   });

   return result;

};

export const productService ={
    postProductInDB,
    postCategoryInDB,
    getProductInDB,
    getSingleProduct,
    updateProductInDB,
    deleteProductInDB,
    getCategoriesInDb
}