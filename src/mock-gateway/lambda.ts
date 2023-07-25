import { randomUUID } from 'crypto';
import { getHeader, getHeaders, getCookies, getBody, getQuery, getIp } from './request';
import { toReqTime, randHex, toStreamTime } from './utils'; // randBase64, 
import { IncomingMessage } from 'http';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

// import { APIGatewayProxyHandlerV2, Context  } from 'aws-lambda';

export interface TMockLambdaOpts {
  apiId?: string;
  accountId?: string;
  logStreamId?: string;
  region?: string;
  functionName?: string;
  functionVersion?: string;
  routeKey?: string;
  stageName?: string;
  domainName?: string;
  logGroupName?: string;
  memoryLimitInMB?: string;
  apiVersion?: number;
}

/**
 * Mock Lambda Getters
 **/
export function MockLambda(opts: TMockLambdaOpts) {
  const apiId = opts.apiId || randHex(5);
  const accountId = opts.accountId || randHex(8);
  const logStreamId = opts.logStreamId || randHex(8);
  const region = opts.region || 'local';
  const functionName = opts.functionName || 'handler';
  const functionVersion = opts.functionVersion || '$LATEST';
  const routeKey = opts.routeKey || '$default';
  const stageName = opts.stageName || '$default';
  const domainName = opts.domainName || `${apiId}.execute-api.${region}.amazonaws.com`;
  const logGroupName = opts.logGroupName || `/aws/lambda/${functionName}`;
  const invokedFunctionArn = `arn:aws:lambda:${region}:${accountId}:function:${functionName}`;
  const memoryLimitInMB = opts.memoryLimitInMB || '1024';
  // const apiVersion = opts.apiVersion || 2;

  return { 
    getEvent: getProxyEvent2, 
    getContext: getContext
  };

  /**
   * Choose Event Getter
   **/
  // function toEvent(version: number) {
  //   switch(version) {
  //     case 2: return getProxyEvent2;
  //     case 1: return getProxyEvent1;
  //     default: return getFunctionEvent;
  //   }
  // }

  /**
   * Function Event
   **/
  // async function getFunctionEvent(req: IncomingMessage) {
  //   const { rawPath, rawQueryString, queryParams } = getQuery(req);
  //   const now = new Date();

  //   return {
  //     version: '2.0',
  //     routeKey: routeKey,
  //     rawPath: rawPath,
  //     rawQueryString: rawQueryString,
  //     cookies: getCookies(req),
  //     headers: getHeaders(req),
  //     queryStringParameters: queryParams,
  //     requestContext: {
  //       accountId: accountId,
  //       apiId: apiId,
  //       domainName: domainName,
  //       domainPrefix: apiId,
  //       http: {
  //         method: req.method,
  //         path: rawPath,
  //         protocol: 'HTTP/1.1',
  //         sourceIp: getIp(req),
  //         userAgent: getHeader(req, 'User-Agent')
  //       },
  //       requestId: randomUUID(),
  //       routeKey: routeKey,
  //       stage: stageName,
  //       time: toReqTime(now),
  //       timeEpoch: now.getTime(),
  //     },
  //     body: await getBody(req),
  //     isBase64Encoded: false
  //   };
  // }

  /**
   * API Gateway Proxy Event V1
   **/
  // async function getProxyEvent1(req: IncomingMessage): Promise<APIGatewayProxyEvent> {
  //   const { rawPath, queryParams } = getQuery(req);
  //   const now = new Date();

  //   return {
  //     version: '1.0',
  //     resource: "/{any+}",
  //     path: rawPath,
  //     httpMethod: req.method,
  //     headers: getHeaders(req),
  //     queryStringParameters: queryParams,
  //     requestContext: {
  //    //   resourceId: randHex(3),
  //       resourcePath: "/{any+}",
  //       httpMethod: req.method,
  //       path: rawPath,
  //       accountId: accountId,
  //       protocol: 'HTTP/1.1',
  //       stage: 'dev',
  //       apiId: apiId,
  //       domainName: domainName,
  //       domainPrefix: apiId,
  //       requestTime: toReqTime(now),
  //       requestTimeEpoch: now.getTime(),
  //       requestId: randomUUID(),
  //       extendedRequestId: randBase64(5),
  //       // identity: {
  //       //   accessKey: null,
  //       //   accountId: null,
  //       //   caller: null,
  //       //   cognitoAuthenticationProvider: null,
  //       //   cognitoAuthenticationType: null,
  //       //   cognitoIdentityId: null,
  //       //   cognitoIdentityPoolId: null,
  //       //   principalOrgId: null,
  //       //   sourceIp: getIp(req),
  //       //   user: null,
  //       //   userAgent: getHeader(req, 'User-Agent'),
  //       //   userArn: null,
  //       // },
  //     },
  //     stageVariables: null,
  //     body: await getBody(req),
  //     isBase64Encoded: false,
  //   }
  // }
  
  /**
   * API Gateway Proxy Event V2
   **/
  async function getProxyEvent2(req: IncomingMessage): Promise<APIGatewayProxyEventV2> {
    const { rawPath, rawQueryString, queryParams } = getQuery(req);
    const now = new Date();

    return {
      version: '2.0',
      routeKey: routeKey,
      rawPath: rawPath,
      rawQueryString: rawQueryString,
      headers: getHeaders(req),
      cookies: getCookies(req),
      queryStringParameters: queryParams,
      requestContext: {
        accountId: accountId,
        apiId: apiId,
        domainName: domainName,
        domainPrefix: apiId,
        http: {
          method: req.method,
          path: rawPath,
          protocol: 'HTTP/1.1',
          sourceIp: getIp(req),
          userAgent: getHeader(req, 'User-Agent'),
        },
        requestId: randomUUID(),
        routeKey: routeKey,
        stage: stageName,
        time: toReqTime(now),
        timeEpoch: now.getTime(),
      },
      body: await getBody(req),
      isBase64Encoded: false,
      // stageVariables: {
      //   stageVariable1: 'value1',
      //   stageVariable2: 'value2',
      // },
    };
  }

  /**
   * Get Context
   **/
  function getContext() {
    const now = new Date();

    return {
      callbackWaitsForEmptyEventLoop: true,
      functionVersion: functionVersion,
      functionName: functionName,
      memoryLimitInMB: memoryLimitInMB,
      logGroupName: logGroupName,
      logStreamName: `${toStreamTime(now)}/[${functionVersion}]${logStreamId}`,
      invokedFunctionArn: invokedFunctionArn,
      awsRequestId: randomUUID(),
      startedAt: now.getTime(),
      getRemainingTimeInMillis: () => 0,
      done: () => void 0,
      fail: () => void 0,
      succeed: () => void 0,
    };
  }
}
