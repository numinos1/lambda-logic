import { Request as TReq, Response as TRes } from 'lambda-api';
import createError from 'http-errors';
import { join } from 'path';
import { ZodTypeAny } from 'zod';

/**
 * Getter Type
 **/
export type TGetter = (data: any, req: TReq, res: TRes) => any;

/**
 * Validator Type
 **/
export type TValidator = ZodTypeAny | undefined;

export type TGuard = (req: TReq) => Promise<Boolean>;

/**
 * API Configuration 
 */
export interface TApiConfig {
  action: string;
  path: string;
  method: string;
  guards: TGuard[];
}

/**
 * Param Type
 **/
export interface TParam {
  getter: TGetter;
  validator: TValidator;
  data: string;
  type?: Function;
}

/**
 * Numo Method
 **/
export class MethodMeta {
  public name: string = '';
  public path: string = '';
  public action: string = '';
  public ref: Function | null = null;
  public guards: TGuard[] = [];
  public params: TParam[] = [];

  /**
   * Constructor
   **/
  constructor(name: string) {
    this.name = name;
  }

  /**
   * Bind Route to Lambda API 
   **/
  bindToApi(api: any, basePath: string, actionClass: Function): TApiConfig {
    const actionMethod = this.ref;

    if (actionMethod == null) {
      throw new Error(`${this.name} method missing route decorator`);
    }
    const routePath = this.toRoutePath(basePath);
    const routeAction = this.toRouteAction(actionMethod, actionClass);

    api[this.action](routePath, routeAction);

    return {
      action: this.action.toUpperCase(),
      path: routePath,
      method: this.name,
      guards: this.guards
    };
  } 

  /**
   * Create Route Path
   */
  toRoutePath(basePath: string): string {
    return '/' +
      join(basePath, this.path)
        .replace(/^\//, '');
  }

  /**
   * Create Route Action Closure
   */
  toRouteAction(actionMethod: Function, actionClass: Function) {
    const routeParams = this.toRouteParams(actionClass);
    const routeGuard = this.toRouteGuard();

    return async function routeAction(req: TReq, res: TRes) {
      await routeGuard(req);

      //console.log('CALL_ROUTE', this.action, path);

      const actionParams = routeParams.map(param => {
        let value: any;
        
        if (param.getter) {
          value = param.getter(param.data, req, res);
        }
        if (param.validator) {
          value = param.validator.parse(value);
        }
        else if (typeof param.type === 'function') {
          value = param.type(value);
        }
        return value;
      })

      return actionMethod.apply(actionClass, actionParams);
    }
  }

  /**
   * Create Route Params Array
   * 
   * - Each route param must have been decorated when defined
   * - Results will be applied at runtime when route is called
   */
  toRouteParams(actionClass: Function): TParam[] {
    const types = Reflect.getMetadata("design:paramtypes", actionClass, this.name);

    return types.map((type: Function, i: number) => {
      const decoratorParams = this.params[i];

      if (!decoratorParams) {
        throw new Error(`${this.name} method missing param decorator at index ${i}`);
      }
      return { ...decoratorParams, type };
    });
  }

  /**
   * Create Route Guard Closure
   * 
   * - Must be at least one guard rule
   * - Guard rules are executed in sequence with logical "or"
   * - Guard rules throw to explicitly deny access
   * - Guard rules return true to immediately grant access
   * - Guard rules return false to continue with next rule
   * - Access is denied if all guard rules return false
   */
  toRouteGuard() {
    const guards = this.guards;
    const guardLen = guards.length;

    if (!guardLen) {
      throw new Error(`${this.name} method missing a guard`);
    }

    return async function routeGuard(req: TReq) {
      for (let i = 0; i < guardLen; ++i) {
        const result = await guards[i](req);
        if (result) return;
      }
      throw new createError.Unauthorized();
    }
  }
}

