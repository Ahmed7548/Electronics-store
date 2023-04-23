import { Request } from "express";
import { AsyncCustomRequestHandler } from "../../types";



export const verifyUserEmail: AsyncCustomRequestHandler<any, any, { verivicationCode: string }, { id: string }> = async (req,res,next) => {
  const userId = req.params.id
  const verivicationCode = req.query.verivicationCode
  



  // redirect to front end page that display wether the user was validated or not 
  // res.redirect() -> will return with a valid access token and refresh token 
}