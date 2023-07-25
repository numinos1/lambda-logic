import { ControllerMeta } from '../metadata/controller.meta';

/**
 * Controller Decorator
 **/
export function Controller(path: string = '') {
  return (ref: Function) => {
    new ControllerMeta(ref.prototype, ref.name, ref, path);
  };
}
