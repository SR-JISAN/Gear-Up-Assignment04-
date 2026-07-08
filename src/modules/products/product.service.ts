import { prisma } from "../../lib/prisma";
import { IProduct } from "./product.interface";

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
        throw new Error("Title is  required");
     };
    if(!details){
        throw new Error("Description is  required");
     };
    if(!brand){
        throw new Error("Brand is  required");
     };
    if(!stock){
        throw new Error("Stock is  required");
     };
    if(!price_per_day || price_per_day >= 0){
        throw new Error("Price is  required & Price must be greater than 0");
     };
    
    if(!categoryId){
        throw new Error("Category is  required");
     };
    
     const category = await prisma.category.findUnique({
        where:{
           id: categoryId
        }
     });

     if(!category){
        throw new Error ("Category not found");
     };

     const product = await prisma.product.create({
        data:{
            ...payload,
            providerId: id
        }

     });

     return product;



};


const postCategoryInDB =async()=>{

};

export const productService ={
    postProductInDB,
    postCategoryInDB
}