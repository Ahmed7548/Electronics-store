import mongoose, { Schema, model, Model } from "mongoose";
const ObjectID = Schema.Types.ObjectId;



interface Category{
  name: string;
}