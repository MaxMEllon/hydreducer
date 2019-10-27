import { Reducer } from "./reducer"
import { AnyAction } from "./action"

interface Compare<S> {
  (a: S, b: S): boolean
}

export class Store<S> {
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

export function createStore<S>(initialState: S, reducer: Reducer<S>) {
  const store = new Store(initialState, reducer)
  return store
}