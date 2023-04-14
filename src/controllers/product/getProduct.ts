import { Handler, NextFunction, Request, Response } from "express";
import { AsyncCustomRequestHandler } from "../../types";
import { GetProductsReq } from "../../json-schemas/schemas/getProduct";

const getProduct: AsyncCustomRequestHandler<any, { id: string }> = async (
	req,
	res,
	next
) => {
	const { id } = req.params;

	// find the product
	res.send("product" + id);
	// if no product send throw HttpError with 404 status code
};

export default getProduct;
