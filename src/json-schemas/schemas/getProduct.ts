import { z } from "zod";
import { formats } from "../regex/regex.js";

export const getProductSchema = z.object({
	id: z.string().regex(formats.objectID),
});
