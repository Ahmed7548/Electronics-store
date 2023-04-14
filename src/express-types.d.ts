import {RequestHandler,Request,Response,NextFunction} from "express"



export type CustomRequestHandler<ReqBody=any,ReqQuery=any,ResBody=any>=RequestHandler<any,ResBody,ReqBody,ReqQuery>