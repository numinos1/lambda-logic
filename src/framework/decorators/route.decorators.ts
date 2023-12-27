import { ControllerMeta } from '../metadata/controller.meta';
import { Role } from '../metadata/method.meta';

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
 * Public Role Decorator
 */
export function Public() {
  return (proto: any, name: string, value: any) => {
    const method = new ControllerMeta(proto).getMethod(name);

    method.role = Role.Public;
  };
}

/**
 * Member Role Decorator
 */
export function Member() {
  return (proto: any, name: string, value: any) => {
    const method = new ControllerMeta(proto).getMethod(name);

    method.role = Role.Member;
  };
}

/**
 * Owner Role Decorator
 */
export function Owner() {
  return (proto: any, name: string, value: any) => {
    const method = new ControllerMeta(proto).getMethod(name);

    method.role = Role.Owner;
  };
}

/**
 * Admin Role Decorator
 */
export function Admin() {
  return (proto: any, name: string, value: any) => {
    const method = new ControllerMeta(proto).getMethod(name);

    method.role = Role.Admin;
  };
}