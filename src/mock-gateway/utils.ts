import { randomBytes } from 'crypto';

type TProcCb = (...args: any[]) => any;

const CATCH_SIGS = [ 
  'SIGTERM', 
  'SIGUSR2', 
  'uncaughtException', 
  'unhandledRejection'
];

const MONTH_NAMES = [
  'Jan', 
  'Feb', 
  'Mar', 
  'Apr', 
  'May', 
  'Jun', 
  'Jul', 
  'Aug', 
  'Sep', 
  'Oct', 
  'Nov', 
  'Dec'
];

/**
 * Generate Random Hex String
 **/
export function randHex(size: number): string {
  return randomBytes(size)
    .toString('hex');
}

/**
 * Generate Random Base64 String
 **/
export function randBase64(size: number): string {
  return randomBytes(size)
    .toString('base64')
}

/**
 * Format Number String
 **/
export function numStr(num: number): string {
  return num < 10
    ? `0${num}`
    : `${num}`;
}

/**
 * Format Time For Stream
 **/
export function toStreamTime(date: Date): string {
  return date.getFullYear() + '/' +
    numStr(date.getMonth() + 1) + '/' +
    numStr(date.getDate());
}

/**
 * Format Time for Request
 **/
export function toReqTime(date: Date): string {
  return numStr(date.getDate()) + '/' +
    MONTH_NAMES[date.getMonth()] + '/' + 
    date.getFullYear() + ':' +
    numStr(date.getHours()) + ':' + 
    numStr(date.getMinutes()) + ':' + 
    numStr(date.getSeconds()) + ' +0000';
}

/**
 * Catch Process Signals
 **/
export function catchSigs(cb: TProcCb) {
  CATCH_SIGS.forEach(event => 
    process.once(event, cb)
  );
}

/**
 * Is an Event Object
 **/
export function isEvent(value: any): boolean {
  return isPlainObject(value) 
    && typeof value.statusCode === 'number';
}

/**
 * Is an Error Object
 **/
export function isError(value: any): boolean {
  return value instanceof Error;
}

/**
 * Is a String
 **/
export function isString(value: any): boolean {
  return typeof value === 'string';
}

/**
 * Is a Date Object
 **/
export function isDate(value: any): boolean {
  return value 
    && Object.prototype.toString.call(value) === "[object Date]" 
    && !isNaN(value);
}

/**
 * Is an Object
 **/
export function isObject(value: any): boolean {
  return value && typeof value === 'object';
}

/**
 * Is a Plain Object
 **/
export function isPlainObject(value: any): boolean {
  return value 
    && Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Cast as Object
 **/
export function toObject<TOut>(value: any): TOut {
  return isObject(value) ? value : {};
}

/**
 * Cast as String
 **/
export function toString(value: any): string {
  if (isString(value)) {
    return value;
  }
  if (isError(value)) {
    return value.toString();
  }
  if (isDate(value)) {
    return value.toISOString();
  }
  if (value instanceof Buffer) {
    return value.toString('utf8');
  }
  return JSON.stringify(value);
}
