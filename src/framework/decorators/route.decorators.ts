import { ControllerMeta } from '../metadata/controller.meta';
import { TGuard } from '../metadata/method.meta';

/**
 * GET Actuib Decorator
 **/
export function Get(path: string = '') {
  return (proto: any, name: string, value: any) => {
    const method = new ControllerMeta(proto).getMethod(name);
    
    method.action = 'get';
    method.path = path;
    method.ref = value.value;
  };
}

/**
 * PUT Action Decorator
 **/
export function Put(path: string = '') {
  return (proto: any, name: string, value: any) => {
    const method = new ControllerMeta(proto).getMethod(name);
    
    method.action = 'put';
    method.path = path;
    method.ref = value.value;
  };
}

/**
 * POST Action Decorator
 **/
export function Post(path: string = '') {
  return (proto: any, name: string, value: any) => {
    const method = new ControllerMeta(proto).getMethod(name);

    method.action = 'post';
    method.path = path;
    method.ref = value.value;
  };
}

/**
 * PATCH Action Decorator
 **/
export function Patch(path: string = '') {
  return (proto: any, name: string, value: any) => {
    const method = new ControllerMeta(proto).getMethod(name);
    
    method.action = 'patch';
    method.path = path;
    method.ref = value.value;
  };
}

/**
 * DELETE Action Decorator
 **/
export function Delete(path: string = '') {
  return (proto: any, name: string, value: any) => {
    const method = new ControllerMeta(proto).getMethod(name);
    
    method.action = 'delete';
    method.path = path;
    method.ref = value.value;
  };
}

/**
 * ALL Action Decorator
 **/
export function All(path: string = '') {
  return (proto: any, name: string, value: any) => {
    const method = new ControllerMeta(proto).getMethod(name);

    method.action = 'delete';
    method.path = path;
    method.ref = value.value;
  };
}

/**
 * Auth Guard Decorator
 */
export function Guard(...guards: TGuard[]) {
  if (!guards.length) {
    throw new Error('Guard rule must be passed to decorator');
  }
  return (proto: any, name: string, value: any) => {
    const method = new ControllerMeta(proto).getMethod(name);

    if (typeof value.value !== 'string') {
      throw new Error(`Controller method ${method.name} role must be a string`);
    }
    guards.forEach(guard =>
      method.guards.push(guard)
    );
  };
}
