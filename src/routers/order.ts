import express from "express";
import { validate } from "../middlewares/validator";
import { couponSchema } from "../json-schemas/schemas/Coupon";
import catchAsycError from "../utils/helpers/catchAsycError";
import { checkCoupon } from "../controllers/order/checkcoupon";
const router = express.Router();

router.get(
  "/check/coupon",
  validate({ schema: couponSchema, whatToValidate: "body" }),
  catchAsycError(checkCoupon)
);

export default router;
