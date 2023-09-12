import { z } from "zod";
import { formats } from "../regex/regex";



export const cancleOrderSchema =z.object({
    id:z.string().regex(formats.objectID)
})

export type CancelOrderIn =z.infer<typeof cancleOrderSchema>