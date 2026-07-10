import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILogin } from "./auth.interface";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../app/errors/AppError";
import httpStatus from "http-status"

const loginInDB = async(payload: ILogin)=>{
     const {email, password} = payload;

     const  logInUser = await prisma.user.findUniqueOrThrow({
        where : {email}
     });

     const isPassMatch = await bcrypt.compare(password,logInUser.password);

     if(!isPassMatch){
         throw new AppError(httpStatus.UNAUTHORIZED,"Invalid Password");
     };

     const jwtPayload = {
        id: logInUser.id,
        email: logInUser.email,
        role: logInUser.role
     }

     const accessToken = jwtUtils.createToken(jwtPayload,config.jwt_access_token_secret,config.jwt_access_token_expiry);

     const refreshToken = jwtUtils.createToken(jwtPayload,config.jwt_refresh_token_secret,config.jwt_refresh_token_expiry);

     return {accessToken, refreshToken};
};

const refreshTokenInBD = async(refToken: string)=>{
     const verifiedToken = await jwtUtils.verifyToken(
       refToken,
       config.jwt_refresh_token_secret,
     );

     if (!verifiedToken.success) {
       throw new Error(verifiedToken.error);
     }

     const { id } = verifiedToken.data as JwtPayload;

     const user = await prisma.user.findUniqueOrThrow({
       where: { id },
     });

     if (user.customer_status === "BLOCKED") {
       throw new AppError(
         httpStatus.FORBIDDEN,
         "User is BLOCKED. Please contact support.",
       );
     }

     const jwtPayload = {
       id,
       email: user.email,
       name: user.name,
       role: user.role,
     };

     const newAccessToken = await jwtUtils.createToken(
       jwtPayload,
       config.jwt_access_token_secret,
       config.jwt_access_token_expiry,
     );

     return { newAccessToken };
};

const logoutInDB = async (userId: string) => {
  return null;
};

export const authService = {
    loginInDB,
    refreshTokenInBD,
    logoutInDB
};