import { NextFunction, request, Request, Response } from "express";
import AJV from "ajv";
import fs from "fs"
import path from "path"
import ajv from "../json-schemas/ajv-instance";


ajv.schemas

type QueryData= "query" | "body" | "params"

class JsonValidator {
	private ajv: AJV;
	constructor(ajvInstance: AJV) {
		this.ajv = ajvInstance;
	}

	validate({
		schemaName,
		WhatToValidate,
	}: {
		schemaName: string;
		WhatToValidate: QueryData[];
    }) {
    
		const validateFunction = this.ajv.getSchema(schemaName);
    return (req: Request, res: Response, next: NextFunction) => {
      const data = {}
      WhatToValidate.forEach(key => {
        Object.assign(data,req[key])
      })
      if (!validateFunction) {
        throw new Error ("schema doesn't exist")
      }
      const valid = validateFunction(data)
      if (!valid) {
        if (req.file) {
					this.deleteFile(req.file.path);
				}
				if (req.files&&req.files.length > 0 && req.files instanceof Array) {
					this.deleteFile(...(req.files.map((file) => file.path)));
        }
        const errors = validateFunction.errors
        res.status(403).json({
          errors:errors?errors.map((ele) => {
            return { msg: ele.instancePath + " " + ele.message };
          }):[],
        })
        return
      }
      next()
      return
    };
  }
  
  private deleteFile(...paths:string[]) {
    paths.forEach((path) => {
      console.log(path,"path from unlink ya man")
      fs.unlink(`./${path}`, (err) => {
        console.log(err);
      });
    });
  }
}



export const jsonValidator=new JsonValidator(ajv)
