
import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma"
import { IUpdateRoleStatus, IUser } from "./user.interface"
import { Role, User_Status } from "../../../generated/prisma/enums";


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
    
};

const getProfileInDB = async(userId: string)=>{

    const profileData = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      omit: {password: true},
      include : {
        profile:true
      }
    });
    return profileData;
};

const updateProfileInDB = async (id: string, payload: any)=>{

    const {name, phone_number,bio,profileImage} = payload

    const updateProfile = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone_number,
        profile: {
          update: {
            profileImage,
            bio,
          },
        },
      },
      omit: { password: true },
      include: {
        profile: true,
      },
    });

    return updateProfile;


}

const updateUserRoleInDB = async (id : string, payload : IUpdateRoleStatus)=>{
    
    const {role , customer_status} = payload

    const user = await prisma.user.findUnique({
        where : {id}
    });

    if(!user){
        throw new Error ("User Not Found")
    };

    if (role && !Object.values(Role).includes(role)) {
      throw new Error("Invalid role");
    };

    if (
      customer_status &&
      !Object.values(User_Status).includes(customer_status)
    ) {
      throw new Error("Invalid status");
    }

    const updateUserRole = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(customer_status && { customer_status }),
      },
    });
    return updateUserRole;
};

export const userService = {
    registerInDB,
    getProfileInDB,
    updateUserRoleInDB,
    updateProfileInDB
}