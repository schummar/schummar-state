import { useEffect, useMemo, useState } from 'react';
import { Store } from './store';
import useEqualityRef from './useEqualityRef';

export function useStoreState<T>(store: Store<T>, options?: { throttle?: number }): T;
export function useStoreState<T, S>(store: Store<T>, selector: (state: T) => S, dependencies?: any[], options?: { throttle?: number }): S;
export function useStoreState<T, S>(store: Store<T>, ...args: any[]): S {
  let selector: (state: T) => S, deps: any[], options: { throttle?: number };
  if (args[0] instanceof Function) {
    selector = args[0];
    deps = args[1] ?? [];
    options = args[2] ?? {};
  } else {
    selector = (x) => x as any;
    deps = [];
    options = args[0] ?? {};
  }

  // This value changes when deps change according to fast-deep-equal
  const depsRef = useEqualityRef(deps);
  // This counter is incremented when the store notifies about changes, in order to trigger another render
  const [counter, setCounter] = useState(0);
  // This value therefore updates when either the store or the deps change or the store notifies
  const value = useMemo(() => selector(store.getState()), [store, depsRef, counter]);

  // The subscription is setup on first render and when store or deps change.
  // The third parameter of subscribe means that it emit and update right after subscription. I think this is important
  // because between evaluating in useMemo and running the effect some time passes, so we can't be sure the value hasn't changed in between.
  useEffect(() => store.subscribe(selector, () => setCounter((c) => c + 1), { runNow: true, throttle: options.throttle }), [
    store,
    depsRef,
  ]);

  return value;
}
