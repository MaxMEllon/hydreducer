import React, { Context, createContext, useMemo } from 'react';
import { ActionCreator, Action } from './action';
import { Reducer, createReducerWithInitialState } from './reducer';
import { createStore, Store } from './store';
import { createSelectorHooks } from './hooks';

type PayloadType<A> = A extends ActionCreator<infer P> ? P : any;

class Module<S extends Record<string, any>, A> {
  private state: S;
  private actions: A;
  private reducer: Reducer<S>;
  private store: Store<S>;
  private context: Context<Store<S>>;

  constructor(actions: A, state: S, reducer: Reducer<S>) {
    this.state = state;
    this.actions = actions;
    this.reducer = reducer;
    this.store = createStore(this.state, this.reducer);
    this.context = createContext(this.store);

    this.useAction = this.useAction.bind(this)
    this.useModuleState = this.useModuleState.bind(this)
  }

  useAction<A extends (ActionCreator<any> | (() => Action<any>))>(actionCreator: A) {
    return useMemo(() => (payload: PayloadType<A>) => {
      this.store.dispatch(actionCreator(payload))
    }, [])
  }

  useModuleState<R>(selector: (state: S) => R) {
    return createSelectorHooks<S, R>(selector, this.context);
  }

  build(): [A, React.FC, this['useAction'], this['useModuleState']] {
    const OriginalProvider = this.context.Provider
    const Provider: React.FC = ({ children }) => (
      <OriginalProvider value={this.store}>
        {children}
      </OriginalProvider>
    )
    return [this.actions, Provider, this.useAction, this.useModuleState];
  }
}

export const createModule = {
  initialState<S>(state: S) {
    return {
      actions<A>(actions: A) {
        return {
          reducer(callback: (actions: A, reducer: Reducer<S>) => Reducer<S>) {
            const reducer = callback(
              actions,
              createReducerWithInitialState(state)
            );
            return {
              build() {
                return new Module(actions, state, reducer).build();
              },
            };
          },
        };
      },
    };
  },
};

export {
  createAction,
  createActionFactory,
  createProgressAction,
  Action,
  AnyAction,
} from './action';
export { Reducer } from './reducer';
export { Store } from './store';
