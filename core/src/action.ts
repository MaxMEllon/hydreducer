export type Action<P> = {
  type: string;
  payload?: P;
  meta?: Record<string | symbol, any>;
  error?: boolean;
};

export type AnyAction = Action<any>;

export interface ActionCreator<P> {
  (payload: P): Action<P>;
  is: (target: string | Action<any>) => boolean;
  type: string;
}

const types = new Map<string, boolean>();

class DuplicationActionTypeError extends Error {}

declare const process: {
  env: {
    NODE_ENV?: string;
  };
};

const validateActionType = (type: string) => {
  if (process.env.NODE_ENV !== 'production') {
    if (types.has(type))
      throw new DuplicationActionTypeError(`${type} is already registrated`);
    types.set(type, true);
  }
  return type;
};

export function createAction<P = void>(
  type: string,
  meta?: Record<string | symbol, any>,
  error?: boolean
): ActionCreator<P> {
  const t = validateActionType(type);
  const action = (payload: P): Action<P> => {
    const isError = payload instanceof Error || error;
    return isError
      ? {
          type: t,
          payload,
          meta,
          error: isError,
        }
      : {
          type: t,
          payload,
          meta,
        };
  };
  action.is = (target: string | AnyAction | ActionCreator<any>): boolean => {
    if (typeof target === 'string') {
      return type === target;
    }
    return type === target.type;
  };
  action.type = type;
  return action;
}

export function createProgressAction<P, S, E = Error>(type: string) {
  return {
    ready: createAction<P>(`${type}/ready`),
    success: createAction<S>(`${type}/success`),
    failure: createAction<E>(`${type}/failure`),
  };
}

export function createActionFactory(prefix: string) {
  return <P = void>(type: string) => {
    return createAction<P>(`${prefix}/${type}`);
  };
}
