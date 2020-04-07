import memoize from 'fast-memoize';

/**
 * This Decorator will memoize a method
 */
export function Memoize() {
  return (target: any, key: any, descriptor: any) => {
    const oldFunc = descriptor.value;
    const newFunc = memoize(oldFunc);
    descriptor.value = function () {
      return newFunc.apply(this, arguments);
    };
  };
}
