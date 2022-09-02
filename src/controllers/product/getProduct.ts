import { Handler, NextFunction, Request, Response } from "express";

const getProduct = (
	req: Request<{ id: string }>,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.params;

	try {
		// find the product
		res.send("product"+id);
		// if no product send 404

	} catch (err) {
		// pass the err to the error handler
		next(err);
	}
};


export default getProduct
