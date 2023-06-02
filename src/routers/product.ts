import express from "express";
import getProduct from "../controllers/product/getProduct.js";
import getProducts from "../controllers/product/getProducts.js";
import { validate } from "../middlewares/validator.js";
import { getProductsSchema } from "../json-schemas/schemas/getProducts.js";
import catchAsycError from "../utils/helpers/catchAsycError.js";
import { getProductSchema } from "../json-schemas/schemas/getProduct.js";
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
