import { z } from "zod";
import { formats } from "../regex/regex";

export const getOrderSchema = z.object({
  id: z.string().regex(formats.objectID),
});

export type GetOrderReqBodyIn = z.infer<typeof getOrderSchema>;
