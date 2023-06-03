<<<<<<< HEAD
import mongoose, { Schema, model, Model } from "mongoose";
const ObjectID = Schema.Types.ObjectId;



interface Category{
  name: string;
}
=======
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
>>>>>>> d14b9018711a8b32d57606d1a2439e7473237d2d
