import { prisma } from "../../lib/prisma";
import { ICategory, IProduct } from "./product.interface";


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
    if(!price_per_day || price_per_day <= 0){
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
      throw new Error("Category already exists");
    }
     const result =await prisma.category.create({
        data:{name}
     });
     return result;
};


const getProductInDB = async()=>{
   const result = await prisma.product.findMany({
     select: {
       id: true,
       title: true,
       details: true,
       availability: true,
       brand: true,
       condition: true,
       price_per_day: true,
       stock: true,
       product_image: true,
       created_at: true,
       updated_at: true,
       category: {
         select: {
           name: true,
         },
       },
       provider:{
        select:{
            name:true
        }
       }
     },
     orderBy: {
       created_at: "asc",
     },
   });
   return result;
}

export const productService ={
    postProductInDB,
    postCategoryInDB,
    getProductInDB
}