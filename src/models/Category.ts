import mongoose, { Schema, model, Model } from "mongoose";
const ObjectID = Schema.Types.ObjectId;



export interface CategoryIn{
  name: string;
  images:{
    thumbnail:string;
    mainImage:string;
    images:string[]
  }
}





const categoriesSchema = new Schema<CategoryIn>({
  name:String,
  images:{
    thumbnail:String,
    mainImage:String,
    images:[String]
  }
})




export const Category= model<CategoryIn>("Category",categoriesSchema)