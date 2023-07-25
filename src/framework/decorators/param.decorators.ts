import { createParamDecorator } from '../core/common';
import { Request as TReq, Response as TRes } from 'lambda-api';

/**
 * Param Requeest Decorator
 **/
export const Request = createParamDecorator<string>(
  (key: string, req: TReq, res: TRes) => key
    ? req[key]
    : req
);

export const Req = Request;

/**
 * Param Response Decorator
 **/
export const Response = createParamDecorator<string>(
  (key: string, req: TReq, res: TRes) => key
    ? (res as any)[key]
    : res
);

export const Res = Response;

/**
 * Param Header Decorator
 **/
export const Header = createParamDecorator<string>(
  (key: string, req: TReq, res: TRes) => key
    ? req.headers?.[key]
    : req.headers
);

/**
 * Param Body Decorator
 **/
export const Body = createParamDecorator<string>(
  (key: string, req: TReq, res: TRes) => key
    ? req.body?.[key]
    : req.body
);

/**
 * Param Query Decorator
 **/
export const Query = createParamDecorator<string>(
  (key: string, req: TReq, res: TRes) => key
    ? req.query?.[key]
    : req.query
);

/**
 * Param Param Decorator
 **/
export const Param = createParamDecorator<string>(
  (key: string, req: TReq, res: TRes) => key
    ? req.params?.[key]
    : req.params
);
