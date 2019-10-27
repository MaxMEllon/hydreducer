import { AnyAction, ActionCreator } from './action'

export interface Handler<S, P> {
  (state: S, payload: P): S
}

export interface Reducer<S> {
  (state: S, action: AnyAction): S
  case<P>(actionCreator: ActionCreator<P>, handler: Handler<S, P>): this
}

export function createReducerWithInitialState<S>(initialState: S): Reducer<S> {
  const actions = new Map<string, Handler<S, any>>()
  const reducer = (state: S = initialState, { type, payload }: AnyAction) => {
    const act = actions.has(type) && actions.get(type)
    return act ? act(state, payload) : state
  }
  reducer.case = <P>(actionCreator: ActionCreator<P>, handler: Handler<S, P>) => {
    actions.set(actionCreator.type, handler)
    return reducer
  }
  return reducer
}