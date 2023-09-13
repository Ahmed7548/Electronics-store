import express from "express";
import { validate } from "../middlewares/validator";
import { couponSchema } from "../json-schemas/schemas/Coupon";
import catchAsycError from "../utils/helpers/catchAsycError";
import { checkCoupon } from "../controllers/order/checkcoupon";
import { orderSchema } from "../json-schemas/schemas/order";
import { order } from "../controllers/order/order";
import { cancleOrderSchema } from "../json-schemas/schemas/cancelOrder";
import { cancelOrder } from "../controllers/order/cancelOrder";
const router = express.Router();

router.get(
  "/check/coupon",
  validate({ schema: couponSchema, whatToValidate: "body" }),
  catchAsycError(checkCoupon)
);

router.post(
  "/place",
  validate({ schema: orderSchema, whatToValidate: "body" }),
  catchAsycError(order)
);


router.post("/cancel",validate({schema:cancleOrderSchema,whatToValidate:"body"}),catchAsycError(cancelOrder))

export default router;
