import {IExtensionEvent, IExtensionEvents} from './IExtension';
import {ObjectManagers} from '../ObjectManagers';
import {ExtensionEvent} from './ExtensionEvent';

export const ExtensionDecorator = <I extends [], O>(fn: (ee: IExtensionEvents) => IExtensionEvent<I, O>) => {
  return (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) => {
    const targetMethod = descriptor.value;
    descriptor.value = async function(...args: I) {
      const event = fn(ObjectManagers.getInstance().ExtensionManager.events) as ExtensionEvent<I, O>;
      const eventObj = {stopPropagation: false};
      const input = await event.triggerBefore({inputs: args}, eventObj);

      // skip the rest of the execution if the before handler asked for stop propagation
      if (eventObj.stopPropagation) {
        return input as O;
      }
      const out = await targetMethod.apply(this, args);
      return await event.triggerAfter(out);
    };

    return descriptor;
  };
};
