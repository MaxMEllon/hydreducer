# About

- type-safe redux and support ducks pattern.

*This module is development now*

# Feature

## Multi store (store instance created each module.)

- Want to hydarate each by module from server.
  - In redux case, that have to do chunking a store state, because that is a single state.
  - That's a incompatible the state chunking and streaming rendering.

## Minimum type definition

- This module is providing to infer types of state, actions, and reducer.
- You have not to do define types.
- Just define object it.

## Other

- tiny
- universal (isomorphic)

# Example

```typescript
const [actions, Provider, useAction, useModuleState] = createModule
  .initialState({
    count: 0
  })
  .actions({
    setCount: createAction<number>("count/set"),
    increment: createAction("count/inc"),
    decrement: createAction("count/dec"),
  })
  .reducer((actions, reducer) => (
    reducer
      .case(actions.setCount, (state, payload) => ({
        ...state,
        count: payload
      })
      .case(actions.increment, (state) => ({
        ...state,
        count: state.count + 1
      }))
      .case(actions.decrement, (state) => ({
        ...state,
        count: state.count - 1
      }))
  ))
  .build()

// original API (like as useDispatch + useCallback)
const increment = useAction(() => actions.increment())
// like `useSelector` in react-redux
const count = useModuleState(state => state.count)
```

# Inspired

- [typeless](https://github.com/typeless-js/typeless)
- [typescript-fsa](https://github.com/aikoven/typescript-fsa)
- [typescript-fsa-reducers](https://github.com/dphilipson/typescript-fsa-reducers)

# TODO

- [ ] testing
- [ ] Promise or Rx or other anything.
- [ ] approach to hydrate from server with React.

# LICENSE

MIT
