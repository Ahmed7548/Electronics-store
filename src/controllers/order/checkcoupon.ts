import { AsyncCustomRequestHandler } from "../../types";
import { CouponIn } from "../../json-schemas/schemas/Coupon";
import { Coupon } from "../../models/Coupon";
import HttpError from "../../Errors/HTTPError";

export const checkCoupon: AsyncCustomRequestHandler<any, CouponIn> = async (
  req,
  res,
  next
) => {
  const { coupon: couponCode } = req.body;
  const coupon = await Coupon.findOne({ code: couponCode });

  if (!coupon) throw new HttpError("there is no coupon with that code", 400);

  if (coupon.isExpired()) throw new HttpError("this coupon has expired", 400);

  res.status(200).json({ coupon: coupon.toObject({ flattenMaps: true }) });
};
