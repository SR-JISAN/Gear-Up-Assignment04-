import JWT, { SignOptions } from "jsonwebtoken";

const createToken = (payload: object, secret: string , expiresIn : string  )=>{
     return JWT.sign(payload,secret, {expiresIn} as SignOptions)
};


const verifyToken = (token: string, secret : string)=>{
    try {
        const verifyToken = JWT.verify(token, secret);
        return {
            success : true,
            data: verifyToken
        }
    } catch (error: any) {
         return {
             success : false,
             error: error.message
         }
    } 
};

export const jwtUtils = {
    createToken,
    verifyToken
}