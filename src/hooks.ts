import {
  Context,
  useContext,
  useLayoutEffect,
  useEffect,
  useRef,
  useReducer,
} from 'react';
import { Store } from './store';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
    ? useLayoutEffect
    : useEffect;

function useSelctor<S, R>(
  selector: (state: S) => R,
  context: Context<Store<S>>,
  compare: <S>(a: S, b: S) => boolean
): R {
  const [, forceRender] = useReducer<(prev: number) => number, number>(
    s => s + 1,
    0,
    () => 0
  );

  const store = useContext(context);

  const latestSelector = useRef<typeof selector>();
  const latestSelectedState = useRef<R>();

  let selectedState: R;
  if (selector !== latestSelector.current) {
    selectedState = selector(store.getState());
  } else {
    selectedState = latestSelector.current(store.getState());
  }

  useIsomorphicLayoutEffect(() => {
    latestSelector.current = selector;
    latestSelectedState.current = selector(store.getState());
  });

  useIsomorphicLayoutEffect(() => {
    function checkForUpdate() {
      const newSelectedState = latestSelector.current!(store.getState());
      if (compare(newSelectedState, latestSelectedState.current)) {
        return;
      }
      forceRender({});
    }

    const id = store.subscribe(checkForUpdate);

    return () => store.unsubscribe(id);
  }, [store]);

  return selectedState;
}

export function createSelectorHooks<S, R>(
  selector: (state: S) => R,
  context: Context<Store<S>>,
  compare: <S>(a: S, b: S) => boolean = (a, b) => a === b
) {
  /* eslint react-hooks/rules-of-hooks: [0] */
  return useSelctor<S, R>(selector, context, compare);
}
