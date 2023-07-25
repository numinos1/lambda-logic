import { MethodMeta } from './method.meta';

/**
 * Global Controllers Registery
 **/
export const controllersMeta = new Map<Object, ControllerMeta>();

/**
 * Numo Controller
 **/
export class ControllerMeta {
  public name: string = '';
  public path: string = '';
  public ref: Function | null = null;
  public methods = new Map<string, MethodMeta>(); 

  /**
   * Constructor
   **/
  constructor(proto: Object, name?: string, ref?: Function, path?: string) {
    let instance = controllersMeta.get(proto);

    if (!instance) {
      instance = this;
      controllersMeta.set(proto, instance);
    }
    name && (instance.name = name);
    ref && (instance.ref = ref);
    path && (instance.path = path);

    return instance;
  }

  /**
   * Get or Create Method
   **/
  getMethod(name: string, action?: string, path?: string, ref?: Function) {
    let method = this.methods.get(name);

    if (!method) {
      method = new MethodMeta(name);
      this.methods.set(name, method);
    }
    action && (method.action = action);
    path && (method.path = path);
    ref && (method.ref = ref);

    return method;
  }
}