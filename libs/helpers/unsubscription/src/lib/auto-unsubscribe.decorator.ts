export function AutoUnsubscribe() {
  return (constructor) => {
    const orig = constructor.prototype.ngOnDestroy;
    constructor.prototype.ngOnDestroy = function() {
      for (const prop in this) {
        const property = this[prop];
        if (typeof property.subscribe === 'function') {
          console.log('Auto-Unsubscribing from prop: ', property);
          property.unsubscribe();
        }
      }
      orig.apply();
    };
  };
}
