export function AutoUnsubscribe(obs$ = []) {
  return function(constructor: any) {
    const orig = constructor.prototype.ngOnDestroy;
    constructor.prototype.ngOnDestroy = function() {
      for (const prop in this) {
        const property = this[prop];
        if (typeof property.unsubscribe === 'function' && !obs$.includes(property)) obs$.push(property);
      }
      for (const ob$ of obs$) {
        ob$.unsubscribe();
      }
      orig.apply();
    };
  };
}
