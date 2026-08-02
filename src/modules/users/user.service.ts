
import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma"
import { IUpdateRoleStatus, IUser } from "./user.interface"
import { Role, User_Status } from "../../../generated/prisma/enums";
import AppError from "../../app/errors/AppError";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { jwtUtils } from "../../utils/jwt";



const registerInDB = async (payload: IUser) => {
  
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email already exists");
  }

 
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcryptSaltRounds),
  );

  // Create user
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      phone_number: payload.phone_number,
      password: hashedPassword,
      role: payload.role,
      profile: {
        create: {
          bio: "",
          profileImage: null,
        },
      },
    },
    include: {
      profile: true,
    },
  });


  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // Generate Tokens
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_token_secret,
    config.jwt_access_token_expiry,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_token_secret,
    config.jwt_refresh_token_expiry,
  );

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return {
    accessToken,
    refreshToken,
    user: userWithoutPassword,
  };
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

const getAllUsersFromDB = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone_number: true,
      role: true,
      customer_status: true,
      created_at: true,
      updated_at: true,
      profile: {
        select: {
          profileImage: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return users;
};

const updateProfileInDB = async (id: string, payload: any)=>{

     const {
       name,
       phone_number,
       profile: { bio, profileImage },
     } = payload;


    const updateProfile = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone_number,
        profile: {
          update: {
            bio,
            profileImage,
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
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    };

    if (role && !Object.values(Role).includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid role");
    };

    if (
      customer_status &&
      !Object.values(User_Status).includes(customer_status)
    ) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid status");
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
    getAllUsersFromDB,
    updateUserRoleInDB,
    updateProfileInDB
}