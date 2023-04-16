import { z } from "zod";
import { formats } from "../regex/regex";

export const getProductSchema = z.object({
	id: z.string().regex(formats.objectID),
});
