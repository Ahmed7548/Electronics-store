import { CorsRequest } from "cors";
import { Request, Response, NextFunction, RequestHandler } from "express";
import HttpError from "../../Errors/HTTPError";

// price range --> from,to  --->const [from,to] split(",")

// get the category id and searching with the category id

interface SearchQuery {
	search: string;
	page: number;
	item_per_page: number;
	from_price: number;
	to_price: number;
	category: string;
}

const getProducts = (
	req: Request<unknown, unknown, unknown, unknown>,
	res: Response,
	next: NextFunction
) => {
	const { category, search, from_price, to_price, page, item_per_page } =
		req.query as SearchQuery;

	// the query

	//check every item to form the query

	res.send(req.query);

	try {
		//await the query and store the data in a const
		// check if data is empty--> and if so res with 404
		//res with the data
	} catch (err) {}
};

export default getProducts;
