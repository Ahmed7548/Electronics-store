import { AsyncCustomRequestHandler } from "../../types";
import HttpError from "../../Errors/HTTPError";
import * as jwt from "jsonwebtoken";
import UnhandledError from "../../Errors/UnhandledError";

// on where we saved the jwt token

const isAuthorized: AsyncCustomRequestHandler = async (req, res, next) => {
  // const accessToken = req.cookies
  if(req.userAuth!=="A_USER")  throw new HttpError("unAuhtorized",401)
  next();
};
