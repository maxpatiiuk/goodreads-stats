import { GetOrSet } from '../utils/types';
import React from 'react';
import { crash } from '../components/Errors/assert';

/**
 * Like React.useState, but initial value is retrieved asynchronously
 * While value is being retrieved, hook returns undefined, which can be
 * conveniently replaced with a default value when destructuring the array
 *
 * @remarks
 * This hook resets the state value every time the prop changes. Thus,
 * you need to wrap the prop in React.useCallback(). This allows for
 * recalculation of the state when parent component props change.
 *
 * If async action is resolved after component destruction, no update occurs
 * (thus no warning messages are triggered)
 *
 * Rejected promises result in a modal error dialog
 *
 * @example
 * This would fetch data from a url, use defaultValue while fetching,
 * reFetch every time url changes, and allow to manually change state
 * value using setValue:
 * ```js
 * const [value=defaultValue, setValue] = useAsyncState(
 *   React.useCallback(()=>fetch(url), [url]);
 * );
 * ```
 */
export function useAsyncState<T>(
  callback: () => Promise<T | undefined> | T | undefined
): GetOrSet<T | undefined> {
  const [state, setState] = React.useState<T | undefined>(undefined);

  /**
   * Using layout effect so that setState(undefined) runs immediately on
   * callback change, rather than give inconsistent state.
   */
  React.useLayoutEffect(() => {
    // If callback changes, state is reset while new state is fetching
    setState(undefined);
    Promise.resolve(callback())
      .then((newState) => (destructorCalled ? undefined : setState(newState)))
      .catch(crash);

    let destructorCalled = false;
    return (): void => {
      destructorCalled = true;
    };
  }, [callback]);

  return [state, setState];
}
