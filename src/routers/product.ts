import express from "express";
import getProduct from "../controllers/product/getProduct";
import getProducts from "../controllers/product/getProducts";
import { validate } from "../middlewares/validator";
import { getProductSchema } from "../json-schemas/schemas/getProduct";
const router = express.Router();

router.get("/product/:id", getProduct);

router.get(
	"/products",
	validate({
		schema: getProductSchema,
		whatToValidate: "body",
	}),
	getProducts
);

export default router;
