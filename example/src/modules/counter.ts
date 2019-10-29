import { createModule, createActionFactory } from "type-reducks"

const createAction = createActionFactory("counter")

export const [actions, Provider, useCounterAction, useCounterState] = createModule
  .initialState({
    count: 0
  })
  .actions({
    increment: createAction("increment"),
    decrement: createAction("decrement"),
  })
  .reducer((actions, reducer) => (
    reducer
      .case(actions.increment, (state) => ({
        count: state.count + 1
      }))
      .case(actions.decrement, (state) => ({
        count: state.count - 1
      }))
  ))
  .build()

