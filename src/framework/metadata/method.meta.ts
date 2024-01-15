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

export type TGuards = TGuard[];

/**
 * API Configuration 
 */
export interface TApiConfig {
  action: string;
  path: string;
  method: string;
  guards: TGuards[];
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
  public guards: TGuards[] = [];
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
   * - Guard rules within a decorator are evaluated with logical AND
   * - Guard rules between decorators are evaluated with logical OR
   * - Guard rules should throw to explicitly deny access
   * - Access granted if all guard rules in a decorator evalute to true.
   * - Access denied if no guard decorator evaluates to true
   */
  toRouteGuard() {
    const guards = this.guards;
    const guardLen = guards.length;

    if (!guardLen) {
      throw new Error(`${this.name} method missing a guard`);
    }
    return async function routeGuard(req: TReq) {
      for (let orIndex = 0; orIndex < guardLen; ++orIndex) {
        const andGuards = guards[orIndex];
        let andIndex = 0;

        while (andIndex < andGuards.length) {
          if (!await andGuards[andIndex](req)) break;
          andIndex++;
        }
        if (andIndex === andGuards.length) {
          return;
        }
      }
      throw new createError.Unauthorized();
    }
  }
}

