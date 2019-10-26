export type Action<P> = P extends Function ? never : {
  type: string,
  payload?: P
  meta?: Record<string | symbol, any>
  error?: boolean
}

export type AnyAction = Action<any>

interface Reducer<S> {
  (state: S, action: AnyAction): S
  case<P>(actionCreator: ActionCreator<P>, handler: Handler<S, P>): this
}

interface Compare<S> {
  (a: S, b: S): boolean
}

class Store<S> {
  private state: S
  private prevState: S
  private reducer: Reducer<S>
  private handlers: Map<number, (state: S) => any>
  private index: number = 0
  private compare: Compare<S>

  constructor(initialState: S, reducer: Reducer<S>, compare: Compare<S> = (a, b) => a === b) {
    this.state = initialState
    this.handlers = new Map<number, (state: S) => any>()
    this.reducer = reducer
    this.compare = compare
    this.prevState = this.state
  }

  public getState() {
    return { ...this.state }
  }

  public subscribe(selector: (state: S) => any) {
    this.handlers.set(this.index, selector)
    return this.index++
  }

  public unsubscribe(subscribeId: number) {
    if (this.handlers.has(subscribeId)) {
      this.handlers.delete(subscribeId)
    }
  }

  public dispatch(action: AnyAction) {
    const newState = this.reducer(this.state, action)
    if (this.compare(this.prevState, newState)) return action
    this.handlers.forEach((f) => {
      setTimeout(() => f(newState))
    })
    return action
  }
}

const types = new Map<string, boolean>() 

class DuplicationActionTypeError extends Error {}

declare const process: {
  env: {
    NODE_ENV?: string
  }
}

const validateActionType = (type: string) => {
  if (process.env.NODE_ENV !== "production") {
    if (types.has(type)) throw new DuplicationActionTypeError(`${type} is already registrated`)
    types.set(type, true)
  }
  return type
}

export interface ActionCreator<P> {
  (payload: P): Action<P>;
  is: (target: string | Action<any>) => boolean
  type: string
}

export function createAction<P = void>(type: string, meta?: Object | undefined, error?: boolean): ActionCreator<P> {
  const t = validateActionType(type)
  const action = (payload: P): Action<P> => {
    return {
      type: t,
      payload,
      meta,
      error: payload instanceof Error || error
    } /* TODO */ as Action<P>
  }
  action.is = (target: string | { type: string }): boolean => {
    if (typeof target === "string") {
      return type === target
    }
    return type === target.type
  }
  action.type = type
  return action
}

export function createProgressAction<P, S, E = Error>(type: string) {
  const readyType = validateActionType(`${type}/ready`)
  const successType = validateActionType(`${type}/success`)
  const failureType = validateActionType(`${type}/failure`)
  return {
    ready: createAction<P>(readyType),
    success: createAction<S>(successType),
    failure: createAction<E>(failureType),
  }
}

export function createActionFactory(prefix: string) {
  return <P = void>(type: string) => {
    const t = validateActionType(`${prefix}/${type}`)
    return createAction<P>(t)
  }
}

interface Handler<S, P> {
  (state: S, payload: P): S
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

export default function createStore<S>(initialState: S, reducer: Reducer<S>) {
  const store = new Store(initialState, reducer)
  return store
}
