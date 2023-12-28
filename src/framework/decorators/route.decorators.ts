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
    throw new Error(`Guard decorator must be passed at least one rule function`);
  }
  return (proto: any, name: string, value: any) => {
    const method = new ControllerMeta(proto).getMethod(name);

    guards.forEach(guard => {
      if (typeof guard !== 'function') {
        throw new Error(`${proto}.${name} Guard decorator rule must be a function: ${guard}`);
      }
      method.guards.push(guard);
    });
  };
}
