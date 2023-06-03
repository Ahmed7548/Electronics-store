import HttpError from "../../Errors/HTTPError";
import UnhandledError from "../../Errors/UnhandledError";
import { AsyncCustomRequestHandler } from "../../types";
import {verify,sign, JwtPayload} from "jsonwebtoken"




const refreshAccess:AsyncCustomRequestHandler = async (req,res,next)=>{
    const refreshToken=req.cookies.refreshToken

    if(!process.env.REFRESHSECRET){
        throw new UnhandledError("provide a refresh secret")
    }


    verify(refreshToken,process.env.REFRESHSECRET,{},(err,decoded)=>{
        if (err){
            throw new HttpError("can't refresh access the refresh token is either expired or incorrect",401)
        }else{
            
            const {id:userID,iat,exp}=decoded as JwtPayload
            
        }
    })
}