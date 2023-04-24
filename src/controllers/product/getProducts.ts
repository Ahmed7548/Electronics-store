import type { AsyncCustomRequestHandler } from "../../types/index.js";
import type { GetProductsReq } from "../../json-schemas/schemas/getProducts.js";
import { Product } from "../../models/Product.js";

// price range --> from,to  --->const [from,to] split(",")

// get the category id and searching with the category id

const getProducts: AsyncCustomRequestHandler<any, GetProductsReq> = async (
	req,
	res,
	next
) => {
	const { category, search, from_price, to_price, page, item_per_page } =
		req.body;
	// the query
	// could filter the products out of stock
	const query = Product.find(
		{ forSale: true },
		{
			_id: 1,
			describtion: 1,
			SKU: 1,
			price: 1,
			name: 1,
			discount: 1,
			"images.thumbnail": 1,
		}
	);
	if (category) {
		query.byCategory(category);
	}
	if (search) {
		query.bySearch(search);
	}

	if (from_price || to_price) {
		query.byPrice({ gt: from_price, lt: to_price });
	}

	query.paginate({ page: page || 0, records: item_per_page || 10 });

	const documents = await query;

	res.status(200).json({ docNum: documents.length, documents });
};

export default getProducts;
