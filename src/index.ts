import { ActionCreator } from 'action'
import { Reducer, createReducerWithInitialState } from 'reducer'
import { createStore, Store } from 'store'

type PayloadType<A> = A extends ActionCreator<infer P> ? P : never

class Module<S extends Record<string, any>, A> {
  private state: S 
  private actions: A
  private reducer: Reducer<S>
  private store: Store<S>

  constructor(actions: A, state: S, reducer: Reducer<S>) {
    this.state = state
    this.actions = actions
    this.reducer = reducer
    this.store = createStore(this.state, this.reducer)
  }

  useAction<A extends ActionCreator<any>>(actionCreator: A) {
    return (payload: PayloadType<A>) => this.store.dispatch(actionCreator(payload))
  }

  useModuleState<R>(selector: (state: S) => R) {
    // TODO: memoized and use context of react
    return selector(this.state)
  }

  build(): [A, this["useAction"], this["useModuleState"]] {
    return [this.actions, this.useAction, this.useModuleState]
  }
}

const createModule = {
  initialState<S>(state: S) {
    return {
      actions<A extends Record<string, ActionCreator<any>>>(actions: A) {
        return {
          reducer(callback: (actions: A, reducer: Reducer<S>) => Reducer<S>) {
            const reducer = callback(actions, createReducerWithInitialState(state))
            return {
              build() {
                return new Module(actions, state, reducer).build()
              }
            }
          }
        } 
      }
    }
  }
}

export { createAction, createActionFactory, createProgressAction, Action, AnyAction } from "action"
export { Reducer } from "reducer"
export { Store } from "store"

export default createModule