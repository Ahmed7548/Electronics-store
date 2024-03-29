import type { AsyncCustomRequestHandler } from "../../types/index.js";
import { Product } from "../../models/Product.js";
import HttpError from "../../Errors/HTTPError.js";

const getProduct: AsyncCustomRequestHandler<any, { id: string }> = async (
	req,
	res,
	next
) => {
	const { id } = req.params;

	// find the product
	const product = await Product.findById(id);

	if (!product)
		throw new HttpError("couldn't find a product with that id", 404);

	res.status(200).json(product);
};

export default getProduct;
