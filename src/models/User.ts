import { Schema, model } from "mongoose";
import bcrypt from "bcrypt"
const ObjectID=Schema.Types.ObjectId
interface UserProps{
  name: {
    first: string;
    family: string
  };
  email: string;
  googleId?: string;
  imageUrl?: string;
  unHashedPasword?: string|null;
  password?: string | {
    hash: string;
    salt: string;
  }
  orders: []
  
}


const userSchema = new Schema<UserProps>({
  name: {
    first: {
      type: String,
      requred:true
    },
    family: {
      type: String,
      required:true,
    }
  },
  email: {
    type: String,
    index:{unique:true},
    required:true
  },
  password: {
    hash: {
      type:String
    },
    salt: {
      type:String
    }
  },
  unHashedPasword: {
    type:String
  },
  imageUrl: {
    type: String,
  },
  googleId: {
    type: String,
    index:{unique:true},
  },
  orders: [{
    type: ObjectID,
    ref:"orders"
  }]
})

userSchema.pre("save", async function (next) {
  const unHashedPasword: string = this.unHashedPasword as string
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(unHashedPasword, salt)
  this.password = {
    hash:hash,
    salt:salt
  }
  this.unHashedPasword = null
  next()
})


export const User=model<UserProps>("User",userSchema)