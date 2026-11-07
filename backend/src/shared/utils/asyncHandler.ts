import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = (fn: Function): RequestHandler => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
export default asyncHandler;
