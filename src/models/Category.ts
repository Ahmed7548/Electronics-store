import mongoose, { Schema, model, Model } from "mongoose";
const ObjectID = Schema.Types.ObjectId;



interface Category{
  name: string;
  images:{
    thumbnail:string;
    mainImage:string;
    images:string[]
  }
}





const categoriesSchema = new Schema<Category>({
  name:String,
  images:{
    thumbnail:String,
    mainImage:String,
    images:[String]
  }
})




export const Category= model<Category>("Category",categoriesSchema)