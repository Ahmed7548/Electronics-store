import { RequestHandler } from "express";

import type { AsyncCustomRequestHandler, Promisfy } from "../../types/index.js";

export default <T extends AsyncCustomRequestHandler>(
	asyncfn: T
): RequestHandler => {
	return (req, res, next) => {
		asyncfn(req, res, next).catch(next);
	};
};
