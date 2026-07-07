import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catch.async";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";


declare global {
    namespace Express {
        interface Request {
            user?:{
                email: string;
                name: string;
                role: Role;
                id: string
            }
        }
    }
};

const auth =  (...requiredRole : Role[])=>{
     return catchAsync (async(req: Request, res: Response, next: NextFunction)=>{
        const token = req.cookies.accessToken ? req.cookies.accessToken
        : req.headers.authorization?.startsWith("Bearer") ?
         req.headers.authorization.split(" ")[1]
         :req.headers.authorization;

        if(!token){
            throw new Error("Please Log In to access this resource");
        };

        const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_token_secret);

        if(!verifiedToken.success){
            throw new Error ("Invalid Token");
        };

        const {name,email ,role,id }= verifiedToken.data as JwtPayload;

        if(!requiredRole.includes(role as Role)){
            throw new Error("You are not authorized to access this resource");
        };

        const user = await prisma.user.findFirstOrThrow({
            where :{
                id,
                name,
                email,
                role
            }
        });


        if(user.customer_status === "BLOCKED"){
            throw new Error(
              "Your account is Blocked. Please contact support.",
            );
        };

        req.user = {
            email,
            name,
            role,
            id
        };

        next ()
     })
}

export default auth;