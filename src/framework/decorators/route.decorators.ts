import { ControllerMeta } from '../metadata/controller.meta';

/**
 * Get Decorator
 **/
export function Get(path: string = '') {
  return (proto: any, name: string, value: any) => {
    new ControllerMeta(proto)
      .getMethod(name, 'get', path, value.value);
  };
}

/**
 * Put Decorator
 **/
export function Put(path: string = '') {
  return (proto: any, name: string, value: any) => {
    new ControllerMeta(proto)
      .getMethod(name, 'put', path, value.value);
  };
}

/**
 * Post Decorator
 **/
export function Post(path: string = '') {
  return (proto: any, name: string, value: any) => {
    new ControllerMeta(proto)
      .getMethod(name, 'post', path, value.value);
  };
}

/**
 * Patch Decorator
 **/
export function Patch(path: string = '') {
  return (proto: any, name: string, value: any) => {
    new ControllerMeta(proto)
      .getMethod(name, 'patch', path, value.value);
  };
}

/**
 * Delete Decorator
 **/
export function Delete(path: string = '') {
  return (proto: any, name: string, value: any) => {
    new ControllerMeta(proto)
      .getMethod(name, 'delete', path, value.value);
  };
}

/**
 * All Decorator
 **/
export function All(path: string = '') {
  return (proto: any, name: string, value: any) => {
    new ControllerMeta(proto)
      .getMethod(name, 'delete', path, value.value);
  };
}