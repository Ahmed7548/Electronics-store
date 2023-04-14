import { NextFunction, Request, Response } from "express";
import HttpError from "../Errors/HTTPError"
import UnhandledError from "../Errors/UnhandledError";

interface DublicationError {
  message: string;
  code: number;
  keyPattern: {
    [key: string]: 1
  };
  keyValue: {
    [key: string]: any
  };
  index:number
}

export const errorHandler = (err:any,req:Request,res:Response,next:NextFunction) => {
  // console.log(err)
  if (err instanceof HttpError) {
    res.status(err.status).json({message: err.message})
    return
  }

  if (err.code && err.code === 11000) {
    const duplicateError=err as DublicationError
    const message =`there is a doc with this ${Object.keys(duplicateError.keyValue)[0]}: ${Object.values(duplicateError.keyValue)[0]}`
    res.status(400).json({ message: message, dublicatKey: true })
    return 
  }

  if (err instanceof UnhandledError) {
    throw err
  }
  res.status(500).json ({message:err.message})
}