import express from "express";
import getProduct from "../controllers/product/getProduct";
import getProducts from "../controllers/product/getProducts";
import { validate } from "../middlewares/validator";
import { getProductsSchema } from "../json-schemas/schemas/getProducts";
import catchAsycError from "../utils/helpers/catchAsycError";
import { getProductSchema } from "../json-schemas/schemas/getProduct";
const router = express.Router();

router.get(
	"/product/:id",
	validate({ schema: getProductSchema, whatToValidate: "params" }),
	catchAsycError(getProduct)
);

router.get(
	"/products",
	validate({
		schema: getProductsSchema,
		whatToValidate: "body",
	}),
	catchAsycError(getProducts)
);

export default router;
