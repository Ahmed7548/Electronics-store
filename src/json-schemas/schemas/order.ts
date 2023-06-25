import { z } from "zod";
import { formats } from "../regex/regex";
export const orderSchema = z.object({
    coupon:z.string(),

})


const productSchema = z.object({
    id:z.string().regex(formats.objectID),
    
})