import {  Response } from "express";
import { TResponse } from "./send.response.typs";

export const sendResponse = <T>( res : Response, data: TResponse<T> )=>{
    res.status(data.statusCode).json({
        success : data.success,
        statusCode : data.statusCode,
        message : data.message,
        data : data.data,
        meta : data.meta
    })
}