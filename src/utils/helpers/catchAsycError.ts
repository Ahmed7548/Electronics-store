import { RequestHandler } from "express";

import { Promisfy } from "../../types";

export default <T extends Promisfy<RequestHandler>>(
	asyncfn: T
): RequestHandler => {
	return (req, res, next) => {
		asyncfn(req, res, next).catch(next);
	};
};
