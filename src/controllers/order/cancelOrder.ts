/* 
guide lines 
    -in order for an order to be cancellable it must have a shipping status --> add a shipping a status to the order 
    -the order is cancellable as long as it is not shipped--> check if the order is shipped or not before cancelling
    -only the order owner can cancell the order 
    -when an order is cancelled the stock of the order products must be changed only if the order still in the warehouse
     otherwise it will be changed from the ware house system when it comes back from the shipping company
    -
*/


import { AsyncCustomRequestHandler } from "../../types";
import { Product } from "../../models/Product";
import {Order} from "../../models/Order"
import { CancelOrderIn } from "../../json-schemas/schemas/cancelOrder";
import HttpError from "../../Errors/HTTPError";
import { Coupon } from "../../models/Coupon";
import { Types } from "mongoose";
// import the interface created by the zod 




export const order:AsyncCustomRequestHandler<any,CancelOrderIn> =async (req,res,next)=>{
    const userId= req.user?.id
    const {id:orderId} = req.body

    if(!userId){
        throw new HttpError("please sign in first before cancelling an order",401)
    }

    const order = await Order.findById(orderId)
    if (!order ) throw new HttpError(`there is no order with id:${orderId} `,404)

    if (order.userId.toString()!== userId)  throw new HttpError("cannot cancell ohters orders", 400)

    if (["Delivered","Returned","Cancelled"].includes(order.shippingStatus)) throw new HttpError(`you can't cancell an order that has been ${order.shippingStatus}`,400)
    
    await order.cancel()
    
}





