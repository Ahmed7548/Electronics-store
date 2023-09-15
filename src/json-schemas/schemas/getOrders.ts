import { z } from "zod";
import { formats } from "../regex/regex.js";

export const getOrdersSchema = z.object({
    page: z.number().positive().optional(),
    Items_Per_Page: z.number().positive().optional()
});


export type GetOrderReqBodyIn =z.infer<typeof getOrdersSchema>
