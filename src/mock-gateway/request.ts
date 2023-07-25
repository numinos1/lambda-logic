import { parse } from 'querystring';
import { isPlainObject, isEvent, isError, toString, toObject } from './utils';
import { IncomingMessage, ServerResponse } from 'http';
import { APIGatewayProxyEventHeaders } from 'aws-lambda';

/**
 * Get Client IP Address
 **/
export function getIp(req: IncomingMessage): string {
  return 'not-implemented';
  // return req.ip 
  //   || req.connection.remoteAddress;
}

/**
 * Get Request Query
 * NOTE - We have to join array values to match the Lambda type spec.
 **/
export function getQuery(req: IncomingMessage) {
  const [ rawPath, rawQueryString ] = req.url.split('?');
  const queryParams = Object.entries(parse(rawQueryString))
    .reduce((out, [key, val]) => {
      out[key] = Array.isArray(val)
        ? val.join(',')
        : val;
      return out;
    }, {});

  return { rawPath, rawQueryString, queryParams };
}

/**
 * Get Request Cookies
 **/
export function getCookies(req: IncomingMessage) {
  const cookies = getHeader(req, 'Cookie');
  
  if (!cookies) {
    return [];
  }
  return Array.isArray(cookies)
    ? cookies
    : cookies.split(';').map(s => s.trim());
}

/**
 * Get Request Headers
 * NOTE - We have to join array values to match the Lambda type spec.
 **/
export function getHeaders(
  req: IncomingMessage
): APIGatewayProxyEventHeaders {
  return Object.entries(req.headers).reduce((out, [key, val]) => {
    out[key] = Array.isArray(val)
      ? val.join(',')
      : val;
    return out;
  }, {});
}

/**
 * Get Request Header
 * NOTE - We have to join array values to match the Lambda type spec.
 **/
export function getHeader(req: IncomingMessage, key: string) {
  const value = req.headers[key]
    || req.headers[key.toLowerCase()]
    || '';
  return Array.isArray(value)
    ? value.join(',')
    : value;
}

/**
 * Get Request Body
 **/
export async function getBody(req: IncomingMessage) {
  if (req.method === 'GET' 
    || req.method === 'HEAD'
  ) {
    return undefined;
  }
  try {
    const buffers = [];

    for await (const chunk of req) {
      buffers.push(chunk);
    }
    return Buffer
      .concat(buffers)
      .toString('utf8');
  } 
  catch (err) {
    return undefined;
  }
}

/**
 * Set Response
 **/
export function setResponse(res: ServerResponse, result: any) {
  if (isError(result)) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.write(toString(result));
  }
  else if (!isEvent(result)) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(toString(result));
  }
  else {
    res.statusCode = result.statusCode;
    res.writeHead(result.statusCode, toObject(result.headers));

    if (isPlainObject(result.multiValueHeaders)) {
      Object.entries(result.multiValueHeaders).forEach(([key, values]) => {
        Array.isArray(values) 
          ? values.forEach(value => res.setHeader(key, value))
          : res.setHeader(key, values as string[]);
      });
    }
    res.write(
      toString(result.body),
      result.isBase64Encoded 
        ? 'base64' 
        : 'utf8'
    );
  }
}
