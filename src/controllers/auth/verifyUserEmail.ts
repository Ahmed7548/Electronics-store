import type { AsyncCustomRequestHandler } from "../../types/index.js";
import { User } from "../../models/User.js";



export const verifyUserEmail: AsyncCustomRequestHandler<any, any, { verivicationCode: string }, { id: string }> = async (req,res,next) => {
  const userId = req.params.id
  const verivicationCode = req.query.verivicationCode
  const user = await User.verify(userId, verivicationCode)

  

  res.send(user)
  // redirect to front end page that display wether the user was validated or not 
  // res.redirect() -> will return with a valid access token and refresh token 
}