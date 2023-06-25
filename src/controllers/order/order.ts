import { AsyncCustomRequestHandler } from "../../types";
import { Product } from "../../models/Product";
import {Order} from "../../models/Order"
import { OrderReq } from "../../json-schemas/schemas/order";
import HttpError from "../../Errors/HTTPError";
import { Coupon } from "../../models/Coupon";
import { Types } from "mongoose";
// import the interface created by the zod 




export const order:AsyncCustomRequestHandler<any,OrderReq> =async (req,res,next)=>{
    const userId=req.user?.id
    const {coupon:code,adresses,products} = req.body
    let discount:{type:"VALUE"|"PERCENT",value:number} = {
        type:"VALUE",
        value:0
    }

    if(!userId){
        throw new HttpError("user is not signed on",401)
    }
    const coupon=await Coupon.findOne({ code: code })

    if(coupon && !coupon.isExpired()){
        discount={
            type:coupon.discountType,
            value:coupon.discountValue
        }
    }

    const order =await Order.placeOrder({
        products:products,
        adresses:adresses,
        discount:discount,
        userId:new Types.ObjectId(userId)
    })

    res.status(200).json({msg:"order placed successfully",order:order})
    
}





