import { CorsRequest } from "cors";
import { Request, Response, NextFunction, RequestHandler } from "express";
import HttpError from "../../Errors/HTTPError";
import { AsyncCustomRequestHandler } from "../../types";
import { GetProductsReq } from "../../json-schemas/schemas/getProduct";

// price range --> from,to  --->const [from,to] split(",")

// get the category id and searching with the category id




const getProducts:AsyncCustomRequestHandler<any,GetProductsReq>  =async (
	req,
	res,
	next,
) => {
	const { category, search, from_price, to_price, page, item_per_page } =
		req.body;

	// the query

	//check every item to form the query

	res.send(req.body);

		//await the query and store the data in a const
		// check if data is empty--> and if so res with 404
		//res with the data
	
};

export default getProducts;
