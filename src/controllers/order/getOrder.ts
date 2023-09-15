import type { AsyncCustomRequestHandler } from "../../types/index.js";
import { Order } from "../../models/Order.js";
import HttpError from "../../Errors/HTTPError.js";
import { Types } from "mongoose";

export const getOrder: AsyncCustomRequestHandler<any, { id: string }> = async (
  req,
  res,
  next
) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId)
    throw new HttpError("user must be signed in to access their orders", 401);

  // find the order
  const order = await Order.findOne({
    _id: new Types.ObjectId(id),
    userId: new Types.ObjectId(userId),
  });

  if (!order) throw new HttpError("couldn't find an order with that id", 404);

  res.status(200).json(order);
};

