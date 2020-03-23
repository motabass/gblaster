export function AutoUnsubscribe(observables$: any[] = []) {
  return (constructor: any) => {
    const originalOnDestroy = constructor.prototype.ngOnDestroy;
    constructor.prototype.ngOnDestroy = function () {
      for (const prop in this) {
        if (this.hasOwnProperty(prop)) {
          const property = this[prop];
          if (typeof property.unsubscribe === 'function' && !observables$.includes(property)) observables$.push(property);
        }
      }
      for (const ob$ of observables$) {
        console.log('Auto-Unsubscibing: ', ob$);
        ob$.unsubscribe();
      }
      originalOnDestroy.apply();
    };
  };
}
