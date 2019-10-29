import { Reducer } from './reducer';
import { AnyAction } from './action';

const isomorphicDeffered =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined' &&
  typeof window.requestAnimationFrame  !== 'function'
    ? (f: () => any) => f()
    : window.requestAnimationFrame

export class Store<S> {
  private state: S;
  private reducer: Reducer<S>;
  private handlers: Map<number, (state: S) => any>;
  private index: number = 0;

  constructor(
    initialState: S,
    reducer: Reducer<S>,
  ) {
    this.state = initialState;
    this.handlers = new Map<number, (state: S) => any>();
    this.reducer = reducer;
  }

  public getState() {
    return this.state;
  }

  public subscribe(selector: (state: S) => any) {
    this.handlers.set(this.index, selector);
    return this.index++;
  }

  public unsubscribe(subscribeId: number) {
    if (this.handlers.has(subscribeId)) {
      this.handlers.delete(subscribeId);
    }
  }

  public dispatch(action: AnyAction) {
    const newState = this.reducer(this.state, action);
    isomorphicDeffered(() => {
      this.handlers.forEach(f => f(newState));
    })
    this.state = newState
    return action;
  }
}

export function createStore<S>(initialState: S, reducer: Reducer<S>) {
  return new Store(initialState, reducer);
}
