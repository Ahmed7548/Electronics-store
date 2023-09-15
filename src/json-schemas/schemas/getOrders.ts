import { z } from "zod";

export const getOrdersSchema = z.object({
  page: z.preprocess(
    (value: any) => (isFinite(value) ? parseInt(value) : value),
    z.number().positive().optional()
  ),
  Items_Per_Page: z.preprocess(
    (value: any) => (isFinite(value) ? parseInt(value) : value),
    z.number().positive().optional()
  ),
});

export type GetOrdersReqBodyIn = z.infer<typeof getOrdersSchema>;
