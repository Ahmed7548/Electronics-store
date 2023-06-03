import { AsyncCustomRequestHandler } from "../../types";
import {verify} from "jsonwebtoken"
import UnhandledError from "../../Errors/UnhandledError";


export const idintify:AsyncCustomRequestHandler=async(req,res,next)=>{
    const accessTocken = req.cookies.accessToken;

    if(!accessTocken){
        req.userAuth="GUEST"
    }

    
  if (!process.env.SECRET) {
    throw new UnhandledError("please provide a secret");
  }
  

  verify(accessTocken, process.env.SECRET,{}, (err, decoded) => {
    if (err) {
      req.userAuth="UNA_USER"
    } else {
        //@ts-ignore
        req.user = decoded;
        req.userAuth="A_USER"
    }
});
next()

}
