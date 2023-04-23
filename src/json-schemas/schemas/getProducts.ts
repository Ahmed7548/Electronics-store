import { z } from "zod";
import { formats } from "../regex/regex";

export const getProductsSchema = z.object({
	search: z.string().optional(),
	category: z.string().regex(formats.objectID).optional(),
	page: z.number().positive().optional(),
	item_per_page: z.number().positive().optional(),
	from_price: z.number().positive().optional(),
	to_price: z.number().positive().optional(),
});


export type GetProductsReq=z.infer<typeof getProductsSchema>
