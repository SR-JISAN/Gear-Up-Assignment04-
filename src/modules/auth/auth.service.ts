import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILogin } from "./auth.interface";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";

const loginInDb = async(payload: ILogin)=>{
     const {email, password} = payload;

     const  logInUser = await prisma.user.findUniqueOrThrow({
        where : {email}
     });

     const isPassMatch = await bcrypt.compare(password,logInUser.password);

     if(!isPassMatch){
         throw new Error ("Invalid Password");
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

export const authService = {
    loginInDb
};