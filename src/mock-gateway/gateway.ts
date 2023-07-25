import { createServer, IncomingMessage, ServerResponse } from 'http';
import { setResponse } from './request';
import { MockLambda, TMockLambdaOpts } from './lambda';
import { catchSigs, isError } from './utils';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

/**
 * Mock Lambda Gateway Server
 **/
export function MockGateway(
  handlerFn: APIGatewayProxyHandlerV2,
  opts: TMockLambdaOpts = {}
) {
  const { getEvent, getContext } = MockLambda(opts);
  const server = createServer(handler);

  catchSigs(terminate);

  return { listen, stop, terminate };

  /**
   * Server Handler
   **/
  async function handler(
    req: IncomingMessage,
    res: ServerResponse
  ) {
    try {
      let isResponse = false;
      const context = getContext();
      const event = await getEvent(req);
      const result = await handlerFn(event, context, (error: any) => {
        isResponse = true;
        setResponse(res, error);
      });
      isResponse || setResponse(res, result);
    } 
    catch (error) {
      setResponse(res, error);
    } 
    finally {
      res.end();
    }
  }
  
  /**
   * Start Server
   **/
  function listen(
    host = '127.0.0.1',
    port = 3000
  ) {
    return new Promise((resolve, reject) => server
      .on('listening', () => {
        resolve(`Server listening on ${host}:${port}`)
      })
      .on('close', () => {
        resolve(`Server closed on ${host}:${port}`)
      })
      .on('error', (err: any) => {
        if (err.syscall === 'listen' // TODO: does this work?
          && err.code === 'EACCES'
        ) {
          reject(new Error(`Port ${port} requires elevated privileges`));
        } 
        else if (err.syscall === 'listen' // TODO: does this work?
          && err.code === 'EADDRINUSE'
        ) {
          reject(new Error(`Port ${port} is already in use`));
        } 
        else {
          reject(err);
        }
      })
      .listen(port, host)
    )
  }

  /**
   * Stop Server
   **/
  function stop() {
    return new Promise((resolve, reject) => {
      server.close(err => err ? reject(err) : resolve(undefined))
    });
  }

  /**
   * Terminate Server
   **/
  async function terminate(
    value: number | Error
  ) {
    if (isError(value)) {
      console.error(value);
    }
    try {
      await stop();
      process.kill(process.pid);
    }
    catch (err) {
      console.error(err);
    }
  }
}
