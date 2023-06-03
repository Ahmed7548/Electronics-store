import  { Schema, model, Model } from "mongoose";



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
