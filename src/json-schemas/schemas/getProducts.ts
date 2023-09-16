import { z } from "zod";
import { formats } from "../regex/regex.js";

export const getProductsSchema = z.object({
	search: z.string().optional(),
	category: z.string().regex(formats.objectID).optional(),
	page: z.preprocess(
		(value: any) => (isFinite(value) ? parseInt(value) : value),
		z.number().positive().optional()
	  ),
	item_per_page: z.preprocess(
		(value: any) => (isFinite(value) ? parseInt(value) : value),
		z.number().positive().optional()
	  ),
	from_price:z.preprocess(
		(value: any) => (isFinite(value) ? parseInt(value) : value),
		z.number().positive().optional()
	  ),
	to_price: z.preprocess(
		(value: any) => (isFinite(value) ? parseInt(value) : value),
		z.number().positive().optional()
	  ),
});


export type GetProductsReq=z.infer<typeof getProductsSchema>
