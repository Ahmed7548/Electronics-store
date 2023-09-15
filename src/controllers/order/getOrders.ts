/* 
    -not all order data is retrieved only the needed ones
    -pagination will be implemented
    -orders is sorted from the most recent to the oldest 
*/

import { Types } from "mongoose";
import UnhandledError from "../../Errors/UnhandledError";
import { Order } from "../../models/Order";
import { AsyncCustomRequestHandler } from "../../types";
import { GetOrdersReqBodyIn } from "../../json-schemas/schemas/getOrders";

export const getOrders: AsyncCustomRequestHandler<
  any,
  GetOrdersReqBodyIn
> = async (req, res, next) => {
  const userId = req.user?.id;
  const { Items_Per_Page, page } = req.body;

  if (!userId) throw new UnhandledError("the user is not signed in!!!!!");
  const orders = await Order.find({ userId: new Types.ObjectId(userId) })
    .sort({ "timeSchduale.placementDate": -1 })
    .paginate({
      page: page || 1,
      records: Items_Per_Page || 20,
    })
    .select("totalPrice shippingStatus timeSchduale _id"); //select the records to be retrieved
    
  res.status(200).json({ orders: orders });
};
