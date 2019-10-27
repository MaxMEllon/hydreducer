# Example

```typescript
const [actions, useAction, useModuleState] = createModule
  .initialState({
    count: 0
  })
  .actions({
    setCount: createAction<number>("count/set")
  })
  .reducer((actions, reducer) => (
    reducer.case(actions.setCount, (state, payload) => {
      state.count = payload
      return state
    })
  ))
  .build()

// like `useDispatch` in redux
const setCount = useAction(actions.setCount)
// like `useSelector` in redux
const count = useModuleState(state => state.count)
```