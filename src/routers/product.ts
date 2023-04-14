import express, { RequestHandler } from "express";
import getProduct from "../controllers/product/getProduct";
import getProducts from "../controllers/product/getProducts";
import { jsonValidator } from "../middlewares/jsonSchemaValidator";
const router = express.Router();

router.get("/product/:id", getProduct);



router.get(
	"/products",
	jsonValidator.validate({
		schemaName: "get-products",
		WhatToValidate: "query",
	}),
	getProducts 
);

export default router;
