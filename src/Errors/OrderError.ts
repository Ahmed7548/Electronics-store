import HttpError from "./HTTPError";


export default class  OrderError extends HttpError {
    constructor(msg:string,public products:{id:string,qty?:number}[]){
        super(msg,400)
    }
} 