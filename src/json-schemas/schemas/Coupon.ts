import { z } from "zod";



export const couponSchema =z.object({
    coupon:z.string().length(10)
})

export type CouponIn =z.infer<typeof couponSchema>