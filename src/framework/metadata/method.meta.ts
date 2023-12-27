import { Request as TReq, Response as TRes } from 'lambda-api';
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

/**
 * Authentication Role
 */
export enum Role {
  Admin = 'ADMIN',
  Owner = 'OWNER',
  Member = 'MEMBER',
  Public = 'PUBLIC'
}

/**
 * API Configuration 
 */
export interface TApiConfig {
  action: string;
  path: string;
  method: string;
  role: Role
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
  public role: Role | null = null;
  public params: TParam[] = [];

  /**
   * Constructor
   **/
  constructor(name: string) {
    this.name = name;
  }

  /**
   * Bind Api
   **/
  bindApi(api: any, basePath: string, proto: Function): TApiConfig {
    const method = this.ref;

    if (method == null) {
      throw new Error(`${this.name} method missing route decorator`);
    }
    if (this.role == null) {
      throw new Error(`${this.name} method missing role decorator`); 
    }

    const path = '/' + join(basePath, this.path).replace(/^\//, '');
    const types = Reflect.getMetadata("design:paramtypes", proto, this.name);

    // Map the method params
    const params: TParam[] = types.map((type: Function, i: number) => {
      const decoratorParams = this.params[i];

      if (!decoratorParams) {
        throw new Error(`${this.name} method missing param decorator at index ${i}`);
      }
      return { ...decoratorParams, type };
    });

    // Action Handler
    api[this.action](path, (req: TReq, res: TRes) => {

      //console.log('CALL_ROUTE', this.action, path);

      return method.apply(proto, params.map(param => {
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
      }));
    });

    return {
      action: this.action.toUpperCase(),
      path: path,
      method: this.name,
      role: this.role
    };
  } 
}

