import { z } from "zod";

import catchAsycError from "../utils/helpers/catchAsycError.js";
import type { CustomRequestHandler } from "../types/index.js";

type QueryData = "body" | "params";

export const validate = ({
	schema,
	whatToValidate,
}: {
	schema: z.Schema;
	whatToValidate: QueryData;
}): CustomRequestHandler<never> => {
	return catchAsycError(async (req, res, next) => {
		req.body = Object.assign(req.body, req.query);
		req[whatToValidate] = schema.parse(req[whatToValidate]);
		next();
	});
};
