
import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma"
import { IUser } from "./user.interface"

const registerInDB = async(payload : IUser)=>{
    const {name, email, password, phone_number , profileImage}= payload;
     const isUserAlreadyHaveEmail  = await prisma.user.findUnique({
        where : {email}
     })

     if(isUserAlreadyHaveEmail){
        throw new Error ("Email Already Exists");
     }

     const saltRounds = Number(config.bcryptSaltRounds);
     const hashPassword = await bcrypt.hash(password,saltRounds);

     const createUser = await prisma.user.create({
        data : {
            name,
            email,
            password: hashPassword,
            phone_number,
            profile:{
                create:{
                    profileImage
                }
            }

        }
     });

     const user = await prisma.user.findUnique({
        where:{id: createUser.id},
        omit:{password: true},
        include:{
            profile:true
        }
     });

     return user;
    
}

const getProfileInDB = async(userId: string)=>{

    const profileData = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      omit: {password: true},
      include : {
        profile:true
      }
    });
    return profileData;
}

export const userService = {
    registerInDB,
    getProfileInDB
}