import { z } from "zod";
import { formats } from "../regex/regex";


const productSchema = z.object({
    id:z.string().regex(formats.objectID),
    qty:z.number().min(1)
})

const addressSchema =z.object({
    country: z.string(),
    governate: z.string(),
    city: z.string(),
    zipCode: z.string().regex(formats.numeric,"zip code must be of all numeric values"),
    streat: z.string(),
    building: z.string(),
    appartement: z.string(),
    fullAdress: z.string(),
  })

export const orderSchema = z.object({
    coupon:z.string().optional(),
    products:z.array(productSchema),
    adresses:z.object({
        shippingAdress: addressSchema,
        billingAdress: addressSchema,
    })

})

export type Adress=z.infer<typeof addressSchema>
export type OrderReq=z.infer<typeof orderSchema>