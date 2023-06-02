import { RequestHandler, Request, Response, NextFunction } from "express";

export type ErrorResponse = {
	message: string;
	err?: any;
};

export type Promisfy<F extends (...args: any[]) => any> = (
	...args: Parameters<F>
) => Promise<Awaited<ReturnType<F>>>;

export type ResType<T> = T | ErrorResponse;

export type CustomRequestHandler<
	ResBody = any,
	ReqBody = any,
	ReqQuery = any,
	ReqParams = any
> = RequestHandler<ReqParams, ResType<ResBody>, ReqBody, ReqQuery>;

export type AsyncCustomRequestHandler<
	ResBody = any,
	ReqBody = any,
	ReqQuery = any,
	ReqParams = any
> = Promisfy<RequestHandler<ReqParams, ResType<ResBody>, ReqBody, ReqQuery>>;
