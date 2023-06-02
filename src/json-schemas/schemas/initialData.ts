import {z} from "zod"
import { formats } from "../regex/regex"


export const initialDataShema= z.object({
    userId:z.string().regex(formats.objectID).optional(),
})