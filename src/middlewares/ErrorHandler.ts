import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import HttpError from "../Errors/HTTPError.js"
import UnhandledError from "../Errors/UnhandledError.js";
import z from "zod";
import { deleteFile } from "../utils/helpers/deleteFile.js";

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

export const errorHandler:ErrorRequestHandler = (err:any,req:Request,res:Response,next:NextFunction) => {
  console.log(err)

  if (req.file) {
    deleteFile(req.file.path);
  }
  if (req.files &&  req.files instanceof Array&&req.files.length > 0 ) {
    deleteFile(...req.files.map((file) => file.path));
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({message: err.message,err})
    return
  }

  if (err.code && err.code === 11000) {
    const duplicateError=err as DublicationError
    const message =`there is a doc with this ${Object.keys(duplicateError.keyValue)[0]}: ${Object.values(duplicateError.keyValue)[0]}`
    res.status(400).json({ message: message, dublicatKey: true,err })
    return 
  }

  if (err instanceof z.ZodError) {
    res.status(400).json({ message: err.message, err })
    return
  }

  if (err instanceof UnhandledError) {
    throw err
  }
  res.status(500).json ({message:err.message,err})
}