import "reflect-metadata";
import { ControllerMeta, controllersMeta } from '../metadata/controller.meta';
import { TGetter } from '../metadata/method.meta';
import { ZodTypeAny, ZodObject } from 'zod';
import { container, InjectionToken } from 'tsyringe';
import { API } from 'lambda-api';

/**
 * Bind Controller Routes to HTTP API
 **/
export function bindControllerRoutes(api: API, controllers: Function[]) {
  controllers.forEach((controller) => {
    const ctrl = controllersMeta.get(controller.prototype);

    if (!ctrl || typeof ctrl.ref !== 'function') {
      throw new Error(`${controller.name} missing @Controller decorator`);
    }
    const instance: Function = container.resolve(
      ctrl.ref as InjectionToken<Function>
    );
    if (!instance) {
      throw new Error(`${controller.name} missing @inject decorator`);
    }
    console.log(`CONTROLLER: ${ctrl.name} ${ctrl.path}`);

    ctrl.methods.forEach(method =>
      method.bindApi(api, ctrl.path, instance)
    );
  });
}

/**
 * Factory to Create a Param Decorator
 **/
export function createParamDecorator<TData>(getter: TGetter) {
  function ParamConstructor(): Function
  function ParamConstructor(data: TData): Function
  function ParamConstructor(validator: ZodTypeAny): Function
  function ParamConstructor(data: TData, validator: ZodTypeAny): Function
  function ParamConstructor(p1?: TData | ZodTypeAny, p2?: ZodTypeAny) {
    let data: any = undefined;
    let validator: ZodTypeAny | undefined = undefined;

    if (p1 instanceof ZodObject) {
      validator = p1;
    }
    else if (p1) {
      data = p1;
      if (p2 instanceof ZodObject) {
        validator = p2;
      }
    }
    return (proto: Object, name: string, index: number) => {
      new ControllerMeta(proto)
        .getMethod(name)
        .params[index] = { getter, validator, data };
    };
  }
  return ParamConstructor;
}
