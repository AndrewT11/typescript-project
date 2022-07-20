    // Binding decorator for this in submit handler and binding in general
export function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalDescriptor = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
      configurable: true,
      enumerable: true,
      get() {
        const boundFn = originalDescriptor.bind(this);
        return boundFn;
      },
    };
    return adjDescriptor;
  }