

# Docs

## Actors as promises

You can create a promise from any actor by using the `toPromise(actor)` function. The promise will resolve with the actor snapshot's `.output` when the actor is done (`snapshot.status === 'done'`) or reject with the actor snapshot's `.error` when the actor is errored (`snapshot.status === 'error'`).

```ts
import { createMachine, createActor, toPromise } from 'xstate';

const machine = createMachine({
  // ...
  states: {
    // ...
    done: { type: 'final' },
  },
  output: {
    count: 42,
  },
});

const actor = createActor(machine);
actor.start();

// Creates a promise that resolves with the actor's output
// or rejects with the actor's error
const output = await toPromise(actor);

console.log(output);
// => { count: 42 }
```

If the actor is already done, the promise will resolve with the actor's `snapshot.output` immediately. If the actor is already errored, the promise will reject with the actor's `snapshot.error` immediately.

## Higher-level actor logic

Higher-level actor logic enhances existing actor logic with additional functionality. For example, you can create actor logic that logs or persists actor state:

```ts
import { fromTransition, type AnyActorLogic } from 'xstate';

const toggleLogic = fromTransition((state, event) => {
  if (event.type === 'toggle') {
    return state === 'paused' ? 'playing' : 'paused';
  }

  return state;
}, 'paused');

function withLogging<T extends AnyActorLogic>(actorLogic: T) {
  const enhancedLogic = {
    ...actorLogic,
    transition: (state, event, actorCtx) => {
      console.log('State:', state);
      return actorLogic.transition(state, event, actorCtx);
    },
  } satisfies T;

  return enhancedLogic;
}

const loggingToggleLogic = withLogging(toggleLogic);
```

## Actors and TypeScript

```ts
const fetcher = fromPromise(
  async ({ input }: { input: { userId: string } }) => {
    const user = await fetchUser(input.userId);

    return user;
  },
);

const machine = setup({
  types: {
    children: {} as {
      fetch1: 'fetcher';
      fetch2: 'fetcher';
    }
  }
  actors: { fetcher }
}).createMachine({
  invoke: {
    src: 'fetchData', // strongly typed
    id: 'fetch2', // strongly typed
    onDone: {
      actions: ({ event }) => {
        event.output; // strongly typed as { result: string }
      },
    },
    input: { userId: '42' }, // strongly typed
  },
});
```



# Invoke

[State machines](https://stately.ai/docs/machines) can “invoke” one or many [actors](https://stately.ai/docs/actors) within a given state. The invoked actor will start when the state is entered, and stop when the state is exited. Any XState actor can be invoked, including simple Promise-based actors, or even complex machine-based actors.

Invoking an actor is useful for managing synchronous or asynchronous work that the state machine needs to orchestrate and communicate with at a high level, but doesn't need to know about in detail.

## The `invoke` property API

An invocation is defined in a state node's configuration with the `invoke` property, whose value is an object that contains:

- `src` - The source of the [actor logic](https://stately.ai/docs/actors#actor-logic) to invoke when creating the actor, or a string referring to actor logic defined in the machine's [provided implementation](https://stately.ai/docs/machines#providing-implementations).
- `id` - A string identifying the actor, unique within its parent machine.
- `input` - The input to pass to the actor.
- `onDone` - Transition that occurs when the actor is complete.
- `onError` - Transition that occurs when the actor throws an error.
- `onSnapshot` - Transition that occurs when the actor emits a new value.
- `systemId` - A string identifing the actor, unique system-wide.



### Property Invoke

```ts
readonly invoke: InvokeDefinition<
    TContext,
    TEvent,
    ProvidedActor,
    ParameterizedObject,
    ParameterizedObject,
    string,
    any,
    any
>[];
```

The logic invoked as actors by this state node.

### Source

```ts
src?: string | AnyActorLogic;
```

The `src` represents the [actor logic](https://stately.ai/docs/actors#actor-logic-creators) the machine should use when creating the actor. There are several actor logic creators available in XState:

- [State machine logic (`createMachine`)](https://stately.ai/docs/actors/#createmachine)
- [Promise logic (`fromPromise`)](https://stately.ai/docs/actors/#frompromise), where invoke will take the `onDone` transition on `resolve`, or the `onError` transition on `reject`
- [Transition function logic (`fromTransition`)](https://stately.ai/docs/actors/#fromtransition), which follows the reducer pattern
- [Observable logic (`fromObservable`)](https://stately.ai/docs/actors/#fromobservable), which can send events to the parent machine, and where invoke will take an `onDone` transition when completed
- [Event observable logic (`fromEventObservable`)](https://stately.ai/docs/actors/#fromeventobservable), like Observable logic but for streams of event objects
- [Callback logic (`fromCallback`)](https://stately.ai/docs/actors/#fromcallback), which can send events to and receive events from the parent machine

The invoke `src` can be *inline* or *provided*.

#### Inline `src`

```ts
invoke: {
  src: fromPromise(…)
}

Or from some logic in the same scope as the machine:
const logic = fromPromise(…)
const machine = createMachine({
  // …
  invoke: {
    src: logic
  }
});
```



#### Provided `src`

The `src` can be [provided in the machine implementation](https://stately.ai/docs/machines#providing-implementations) and referenced using a string or an object.

```ts
const machine = createMachine({
  // …
  invoke: {
    src: 'workflow', // string reference
  },
});

const actor = createActor(
  machine.provide({
    actors: {
      workflow: fromPromise(/* ... */), // provided
    },
  }),
);
```



Actors can be invoked within any state *except* for the [top-level final state](https://stately.ai/docs/final-states). In the following example, the `loading` state invokes a Promise-based actor:

```ts
import { setup, createActor, fromPromise, assign } from 'xstate';

const fetchUser = (userId: string) =>
  fetch(`https://example.com/${userId}`).then((response) => response.text());

const userMachine = setup({
  types: {
    context: {} as {
      userId: string;
      user: object | undefined;
      error: unknown;
    },
  },
  actors: {
    fetchUser: fromPromise(async ({ input }: { input: { userId: string } }) => {
      const user = await fetchUser(input.userId);

      return user;
    }),
  },
}).createMachine({
  id: 'user',
  initial: 'idle',
  context: {
    userId: '42',
    user: undefined,
    error: undefined,
  },
  states: {
    idle: {
      on: {
        FETCH: { target: 'loading' },
      },
    },
    loading: {
      invoke: {
        id: 'getUser',
        src: 'fetchUser',
        input: ({ context: { userId } }) => ({ userId }),
        onDone: {
          target: 'success',
          actions: assign({ user: ({ event }) => event.output }),
        },
        onError: {
          target: 'failure',
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    success: {},
    failure: {
      on: {
        RETRY: { target: 'loading' },
      },
    },
  },
});
```

### invoke an actor

```ts
import { setup, createActor, fromPromise, assign } from 'xstate';

const fetchUser = (userId: string) =>
  fetch(`https://example.com/${userId}`).then((response) => response.text());

const userMachine = setup({
  actors: {
    getUser: fromPromise(async ({ input }: { input: { userId: string } }) => {
      const data = await fetchUser(input.userId);

      return data;
    }),
  },
}).createMachine({
  // …
  states: {
    idle: {
      on: {
        FETCH: { target: 'loading' },
      },
    },
    loading: {
      invoke: {
        id: 'getUser',
        src: 'getUser',
        input: ({ context: { userId } }) => ({ userId }),
        onDone: {
          target: 'success',
          actions: assign({ user: ({ event }) => event.output }),
        },
        onError: {
          target: 'failure',
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    success: {},
    failure: {
      on: {
        RETRY: { target: 'loading' },
      },
    },
  },
});
```



### invoke an actor on the root of the machine

```ts
import { createMachine } from 'xstate';
import { fromEventObservable, fromEvent } from 'rxjs';

const interactiveMachine = createMachine({
  invoke: {
    src: fromEventObservable(
      () => fromEvent(document.body, 'click') as Subscribable<EventObject>,
    ),
  },
  on: {
    click: {
      actions: ({ event }) => console.log(event),
    },
  },
});
```



### function fromPromise()

```ts
fromPromise: <TOutput, TInput = {}, TEmitted extends EventObject = EventObject>(
    promiseCreator: ({
        input,
        system,
        self,
        signal,
        emit,
    }: {
        input: TInput;
        system: AnyActorSystem;
        self: PromiseActorRef<TOutput>;
        signal: AbortSignal;
        emit: (emitted: TEmitted) => void;
    }) => PromiseLike<TOutput>
) => PromiseActorLogic<TOutput, TInput, TEmitted>;
```

An actor logic creator which returns promise logic as defined by an async process that resolves or rejects after some time.

Actors created from promise actor logic (“promise actors”) can:

\- Emit the resolved value of the promise - Output the resolved value of the promise

Sending events to promise actors will have no effect.

#### Parameter promiseCreator

A function which returns a Promise, and accepts an object with the following properties:

\- `input` - Data that was provided to the promise actor - `self` - The parent actor of the promise actor - `system` - The actor system to which the promise actor belongs

## invoking Promises

The most common type of actors you’ll invoke are promise actors. Promise actors allow you to await the result of a promise before deciding what to do next.



XState can invoke Promises as actors using the `fromPromise` actor logic creator. Promises can:

- `resolve()`, which will take the `onDone` transition
- `reject()` (or throw an error), which will take the `onError` transition

If the state where the invoked promise is active is exited before the promise settles, the result of the promise is discarded.

```ts
import { setup, createActor, fromPromise, assign } from 'xstate';

// Function that returns a Promise
// which resolves with some useful value
// e.g.: { name: 'David', location: 'Florida' }
const fetchUser = (userId: string) =>
  fetch(`/api/users/${userId}`).then((response) => response.json());

const userMachine = setup({
  types: {
    context: {} as {
      userId: string;
      user: object | undefined;
      error: unknown;
    },
  },
}).createMachine({
  id: 'user',
  initial: 'idle',
  context: {
    userId: '42',
    user: undefined,
    error: undefined,
  },
  states: {
    idle: {
      on: {
        FETCH: { target: 'loading' },
      },
    },
    loading: {
      invoke: {
        id: 'getUser',
        src: fromPromise(({ input }) => fetchUser(input.userId)),
        input: ({ context: { userId } }) => ({ userId }),
        onDone: {
          target: 'success',
          actions: assign({ user: ({ event }) => event.output }),
        },
        onError: {
          target: 'failure',
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    success: {},
    failure: {
      on: {
        RETRY: { target: 'loading' },
      },
    },
  },
});
```





## Dynamic parameters

It is recommended to use dynamic parameters in [actions](https://stately.ai/docs/actions) and [guards](https://stately.ai/docs/guards) as they allow you to make reusable functions that are not closely tied to the machine, and are strongly-typed.

```ts
import { setup } from 'xstate';

const feedbackMachine = setup({
  types: {
    context: {} as {
      user: { name: string };
    },
  },
  actions: {
    greet: (_, params: { name: string }) => {
      console.log(`Hello, ${params.name}!`);
    },
  },
}).createMachine({
  context: {
    user: {
      name: 'David',
    },
  },
  // ...
  entry: {
    type: 'greet',
    params: ({ context }) => ({
      name: context.user.name,
    }),
  },
});


```



## Asserting events

### Actions and Guards

It is strongly recommended to use dynamic parameters instead of directly accessing the event object whenever possible for improved type safety and reusability.

If using dynamic parameters is infeasible and you must use the event in an action or guard implementation, you can assert the event type using the `assertEvent(...)` helper function:

```ts
    import { createMachine, assertEvent } from 'xstate';

const machine = createMachine({
  types: {
    events: {} as
      | { type: 'greet'; message: string }
      | { type: 'log'; message: string }
      | { type: 'doSomethingElse' },
  },
  // ...
  states: {
    someState: {
      entry: ({ event }) => {
        // In the entry action, it is currently not possible to know
        // which event this action was called with.
    // Calling `assertEvent` will throw if
    // the event is not the expected type.
    assertEvent(event, 'greet');

    // Now we know the event is a `greet` event,
    // and we can access its `message` property.
    console.log(event.message.toUpperCase());
  },
  // ...
  exit: ({ event }) => {
    // You can also assert multiple possible event types.
    assertEvent(event, ['greet', 'log']);

    // Now we know the event is a `greet` or `log` event,
    // and we can access its `message` property.
    console.log(event.message.toUpperCase());
  },
},
  },
});
```


### Invoked Actor Input

Another case where it helpful to use `assertEvent` is when specifying `input` for an invoked actor. The `event` received could be any one of the events received by that actor. In order for TypeScript to recognize the event type and its properties, you can use `assertEvent` to narrow down the event type.

```typescript
import { createMachine, assertEvent } from 'xstate';

const machine = createMachine({
  types: {
    events: {} as
      | { type: 'messageSent'; message: string }
      | { type: 'incremented'; count: number },
  },
  actors: {
    someActor: fromPromise<void, { message: string }>(({ input }) => {
      // actor implementation
    }),
  }
  // ...
  states: {
    someState: {
      invoke: {
        src: 'someActor',
        input: ({ event }) => {
          assertEvent(event, 'messageSent');

          return { message: event.message };
        },
      },
    },
  },
});
```



# Actions and actors

While the state machine is running, it can execute effects called actions. Actions are executed when a transition is triggered. Actions are “fire-and-forget effects”; once the machine has fired the action, it continues processing the transition and forgets the action. You can also fire actions when a state is entered or exited. [Read more about actions](https://stately.ai/docs/actions).

State machines can invoke actors as longer-running processes that can receive events, send events, and change their behavior based on the events they receive. You can invoke actors on entry to a state and stop on exit. [Read more about actors](https://stately.ai/docs/actors).



## Action objects

Action objects have an action `type` and an optional `params` object:

- The action `type` property describes the action. Actions with the same type have the same implementation.
- The action `params` property hold parameterized values that are relevant to the action.

```ts
import { setup } from 'xstate';

const feedbackMachine = setup({
  actions: {
    track: (_, params: { response: string }) => {
      /* ... */
    },
  },
}).createMachine({
  // ...
  states: {
    // ...
    question: {
      on: {
        'feedback.good': {
          actions: [
            {
              // Action type
              type: 'track',
              // Action params
              params: { response: 'good' },
            },
          ],
        },
      },
    },
  },
});
```



## Dynamic action parameters

You can dynamically pass parameters in the `params` property to action objects by using a function that returns the params. The function takes in an object that contains the current `context` and `event` as arguments.

```ts
import { setup } from 'xstate';

const feedbackMachine = setup({
  actions: {
    logInitialRating: (_, params: { initialRating: number }) => {
      // ...
    },
  },
}).createMachine({
  context: {
    initialRating: 3,
  },
  entry: [
    {
      type: 'logInitialRating',
      params: ({ context }) => ({
        initialRating: context.initialRating,
      }),
    },
  ],
});
```

This is a recommended approach for making actions more reusable, since you can define actions that do not rely on the machine’s `context` or `event` types.

```ts
import { setup } from 'xstate';

function logInitialRating(_, params: { initialRating: number }) {
  console.log(`Initial rating: ${params.initialRating}`);
}

const feedbackMachine = setup({
  actions: { logInitialRating },
}).createMachine({
  context: { initialRating: 3 },
  entry: [
    {
      type: 'logInitialRating',
      params: ({ context }) => ({
        initialRating: context.initialRating,
      }),
    },
  ],
});
```

## Invoking Actors

```ts
import { setup, fromPromise, createActor, assign } from 'xstate';

const loadUserLogic = fromPromise(async () => {
  const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
  const user = await response.json();
  return user;
});

const machine = setup({
  actors: { loadUserLogic },
}).createMachine({
  id: 'toggle',
  initial: 'loading',
  context: {
    user: undefined,
  },
  states: {
    loading: {
      invoke: {
        id: 'loadUser',
        src: 'loadUserLogic',
        onDone: {
          target: 'doSomethingWithUser',
          actions: assign({
            user: ({ event }) => event.output,
          }),
        },
        onError: {
          target: 'failure',
          actions: ({ event }) => {
            console.log(event.error);
          },
        },
      },
    },
    doSomethingWithUser: {
      // ...
    },
    failure: {
      // ...
    },
  },
});

const actor = createActor(machine);

actor.subscribe((snapshot) => {
  console.log(snapshot.context.user);
});

actor.start();
// eventually logs:
// { id: 1, name: 'Leanne Graham', ... }
```



Invoking Actions with actors

```ts
import { setup, createActor, fromPromise } from 'xstate';

const loadUserLogic = fromPromise(async ({ input }) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users/${input.id}`,
  );
  const user = await response.json();
  return user;
});

const machine = setup({
  actors: {
    loadUserLogic,
  },
}).createMachine({
  initial: 'loading user',
  states: {
    'loading user': {
      invoke: {
        id: 'loadUser',
        src: 'loadUserLogic',
        input: {
          id: 3,
        },
        onDone: {
          actions: ({ event }) => {
            console.log(event.output);
          },
        },
      },
    },
  },
});

const actor = createActor(machine);

actor.start();
// eventually logs:
// { id: 3, name: 'Clementine Bauch', ... }
```



## Type helpers

```ts
import { setup, fromPromise } from 'xstate';

const promiseLogic = fromPromise(async () => {
  /* ... */
});

const machine = setup({
  types: {
    context: {} as {
      count: number;
    };
    events: {} as
      | { type: 'inc'; }
      | { type: 'dec' }
      | { type: 'incBy'; amount: number };
    actions: {} as
      | { type: 'notify'; params: { message: string } }
      | { type: 'handleChange' };
    guards: {} as
      | { type: 'canBeToggled' }
      | { type: 'isAfterTime'; params: { time: string } };
    children: {} as {
      promise1: 'someSrc';
      promise2: 'someSrc';
    };
    delays: 'shortTimeout' | 'longTimeout';
    tags: 'tag1' | 'tag2';
    input: number;
    output: string;
  },
  actors: {
    promiseLogic
  }
}).createMachine({
  // ...
});
```

XState provides some type helpers to make it easier to work with types in TypeScript.

### `ActorRefFrom<T>`

Results in an `ActorRef` from the provided `T` actor logic parameter, which is useful for creating strongly-typed actors. The `T` parameter can be any `ActorLogic`, such as the return value of `createMachine(…)`, or any other actor logic, such as `fromPromise(…)` or `fromObservable(…)`.

```ts
import { type ActorRefFrom } from 'xstate';
import { someMachine } from './someMachine';

type SomeActorRef = ActorRefFrom<typeof someMachine>;
```



### `SnapshotFrom<T>`

Results in a `Snapshot` from the provided `T` parameter, which is useful for creating strongly-typed snapshots. The `T` parameter can be any `ActorLogic` or `ActorRef`.

```ts
import { type SnapshotFrom } from 'xstate';
import { someMachine } from './someMachine';

type SomeSnapshot = SnapshotFrom<typeof someMachine>;
```



### `EventFromLogic<T>`

Results in an union of all event types defined in the provided `T` actor logic parameter. Useful for type-safe event handling.

```ts
import { type EventFromLogic } from 'xstate';
import { someMachine } from './someMachine';

// SomeEvent would be a union of all event
// types defined in `someMachine`.
type SomeEvent = EventFromLogic<typeof someMachine>;
```



## Assigner

```ts
type Assigner<
    TContext extends MachineContext,
    TExpressionEvent extends EventObject,
    TParams extends ParameterizedObject['params'] | undefined,
    TEvent extends EventObject,
    TActor extends ProvidedActor
> = (
    args: AssignArgs<TContext, TExpressionEvent, TEvent, TActor>,
    params: TParams
) => Partial<TContext>;
```



**Assigner (funksjonsassigner)**: Dette er en **funksjon** som du passerer som argument til `assign(...)`. Denne funksjonen tar inn den nåværende konteksten og hendelsen som argumenter, og den **returnerer et** **delvis** **eller** **fullstendig** **nytt kontekstobjekt** [actions.md 329]. XState vil deretter slå sammen dette returnerte objektet med den eksisterende konteksten for å skape en ny, uforanderlig kontekst.

```ts
import { Spawner } from "../spawn.js";
import type { ActionArgs, AnyEventObject, Assigner, EventObject, LowInfer, MachineContext, ParameterizedObject, PropertyAssigner, ProvidedActor, ActionFunction } from "../types.js";
export interface AssignArgs<TContext extends MachineContext, TExpressionEvent extends EventObject, TEvent extends EventObject, TActor extends ProvidedActor> extends ActionArgs<TContext, TExpressionEvent, TEvent> {
    spawn: Spawner<TActor>;
}
export interface AssignAction<TContext extends MachineContext, TExpressionEvent extends EventObject, TParams extends ParameterizedObject['params'] | undefined, TEvent extends EventObject, TActor extends ProvidedActor> {
    (args: ActionArgs<TContext, TExpressionEvent, TEvent>, params: TParams): void;
    _out_TActor?: TActor;
}
/**
 * Updates the current context of the machine.
 *
 * @example
 *
 * ```ts
 * import { createMachine, assign } from 'xstate';
 *
 * const countMachine = createMachine({
 *   context: {
 *     count: 0,
 *     message: ''
 *   },
 *   on: {
 *     inc: {
 *       actions: assign({
 *         count: ({ context }) => context.count + 1
 *       })
 *     },
 *     updateMessage: {
 *       actions: assign(({ context, event }) => {
 *         return {
 *           message: event.message.trim()
 *         };
 *       })
 *     }
 *   }
 * });
 * ```
 *
 * @param assignment An object that represents the partial context to update, or
 *   a function that returns an object that represents the partial context to
 *   update.
 */
export declare function assign<TContext extends MachineContext, TExpressionEvent extends AnyEventObject, // TODO: consider using a stricter `EventObject` here
TParams extends ParameterizedObject['params'] | undefined, TEvent extends EventObject, TActor extends ProvidedActor>(assignment: Assigner<LowInfer<TContext>, TExpressionEvent, TParams, TEvent, TActor> | PropertyAssigner<LowInfer<TContext>, TExpressionEvent, TParams, TEvent, TActor>): ActionFunction<TContext, TExpressionEvent, TEvent, TParams, TActor, never, never, never, never>;

```



## Setup

#### functon setup()

```ts
setup: <
    TContext extends MachineContext,
    TEvent extends AnyEventObject,
    TActors extends Record<string, UnknownActorLogic> = {},
    TChildrenMap extends Record<string, string> = {},
    TActions extends Record<string, {}> = {},
    TGuards extends Record<string, {}> = {},
    TDelay extends string = never,
    TTag extends string = string,
    TInput = {},
    TOutput extends {} = {},
    TEmitted extends EventObject = EventObject,
    TMeta extends MetaObject = MetaObject
>({
    schemas,
    actors,
    actions,
    guards,
    delays,
}: {
    schemas?: unknown;
    types?: SetupTypes<
        TContext,
        TEvent,
        TChildrenMap,
        TTag,
        TInput,
        TOutput,
        TEmitted,
        TMeta
    >;
    actors?: {
        [K in keyof TActors | Values<TChildrenMap>]: K extends keyof TActors
            ? TActors[K]
            : never;
    };
    actions?: {
        [K in keyof TActions]: ActionFunction<
            TContext,
            TEvent,
            TEvent,
            TActions[K],
            ToProvidedActor<TChildrenMap, TActors>,
            ToParameterizedObject<TActions>,
            ToParameterizedObject<TGuards>,
            TDelay,
            TEmitted
        >;
    };
    guards?: {
        [K in keyof TGuards]: GuardPredicate<
            TContext,
            TEvent,
            TGuards[K],
            ToParameterizedObject<TGuards>
        >;
    };
    delays?: {
        [K in TDelay]: DelayConfig<
            TContext,
            TEvent,
            ToParameterizedObject<TActions>['params'],
            TEvent
        >;
    };
} & { [K in RequiredSetupKeys<TChildrenMap>]: unknown }) => {
    createMachine: () => const;
};
```



## setup.d.ts

```ts
import { StateMachine } from "./StateMachine.js";
import { GuardPredicate } from "./guards.js";
import { ActionFunction, AnyActorRef, AnyEventObject, Cast, DelayConfig, EventObject, Invert, IsNever, MachineConfig, MachineContext, MetaObject, NonReducibleUnknown, ParameterizedObject, SetupTypes, ToChildren, ToStateValue, UnknownActorLogic, Values } from "./types.js";
type ToParameterizedObject<TParameterizedMap extends Record<string, ParameterizedObject['params'] | undefined>> = IsNever<TParameterizedMap> extends true ? never : Values<{
    [K in keyof TParameterizedMap & string]: {
        type: K;
        params: TParameterizedMap[K];
    };
}>;
type ToProvidedActor<TChildrenMap extends Record<string, string>, TActors extends Record<string, UnknownActorLogic>> = IsNever<TActors> extends true ? never : Values<{
    [K in keyof TActors & string]: {
        src: K;
        logic: TActors[K];
        id: IsNever<TChildrenMap> extends true ? string | undefined : K extends keyof Invert<TChildrenMap> ? Invert<TChildrenMap>[K] & string : string | undefined;
    };
}>;
type RequiredSetupKeys<TChildrenMap> = IsNever<keyof TChildrenMap> extends true ? never : 'actors';
export declare function setup<TContext extends MachineContext, TEvent extends AnyEventObject, // TODO: consider using a stricter `EventObject` here
TActors extends Record<string, UnknownActorLogic> = {}, TChildrenMap extends Record<string, string> = {}, TActions extends Record<string, ParameterizedObject['params'] | undefined> = {}, TGuards extends Record<string, ParameterizedObject['params'] | undefined> = {}, TDelay extends string = never, TTag extends string = string, TInput = NonReducibleUnknown, TOutput extends NonReducibleUnknown = NonReducibleUnknown, TEmitted extends EventObject = EventObject, TMeta extends MetaObject = MetaObject>({ schemas, actors, actions, guards, delays }: {
    schemas?: unknown;
    types?: SetupTypes<TContext, TEvent, TChildrenMap, TTag, TInput, TOutput, TEmitted, TMeta>;
    actors?: {
        [K in keyof TActors | Values<TChildrenMap>]: K extends keyof TActors ? TActors[K] : never;
    };
    actions?: {
        [K in keyof TActions]: ActionFunction<TContext, TEvent, TEvent, TActions[K], ToProvidedActor<TChildrenMap, TActors>, ToParameterizedObject<TActions>, ToParameterizedObject<TGuards>, TDelay, TEmitted>;
    };
    guards?: {
        [K in keyof TGuards]: GuardPredicate<TContext, TEvent, TGuards[K], ToParameterizedObject<TGuards>>;
    };
    delays?: {
        [K in TDelay]: DelayConfig<TContext, TEvent, ToParameterizedObject<TActions>['params'], TEvent>;
    };
} & {
    [K in RequiredSetupKeys<TChildrenMap>]: unknown;
}): {
    createMachine: <const TConfig extends MachineConfig<TContext, TEvent, ToProvidedActor<TChildrenMap, TActors>, ToParameterizedObject<TActions>, ToParameterizedObject<TGuards>, TDelay, TTag, TInput, TOutput, TEmitted, TMeta>>(config: TConfig) => StateMachine<TContext, TEvent, Cast<ToChildren<ToProvidedActor<TChildrenMap, TActors>>, Record<string, AnyActorRef | undefined>>, ToProvidedActor<TChildrenMap, TActors>, ToParameterizedObject<TActions>, ToParameterizedObject<TGuards>, TDelay, ToStateValue<TConfig>, TTag, TInput, TOutput, TEmitted, TMeta, TConfig>;
};
export {};
```



### Docs

###### property invoke

```ts
readonly invoke: InvokeDefinition<
    TContext,
    TEvent,
    ProvidedActor,
    ParameterizedObject,
    ParameterizedObject,
    string,
    any,
    any[];

```

Type PropertyAssigner

```ts
type PropertyAssigner<
    TContext extends MachineContext,
    TExpressionEvent extends EventObject,
    TParams extends ParameterizedObject['params'] | undefined,
    TEvent extends EventObject,
    TActor extends ProvidedActor

> = {
> [K in keyof TContext]?:
>    | PartialAssigner<TContext, TExpressionEvent, TParams, TEvent, TActor, K>
>    | TContext[K];
> };




```

```ts
type PromiseActorLogic<
    TOutput,
    TInput = unknown,
    TEmitted extends EventObject = EventObject
> = ActorLogic<
    PromiseSnapshot<TOutput, TInput>,
    {
        type: string;
        [k: string]: unknown;
    },
    TInput, // input
    AnyActorSystem,
    TEmitted
>;

```

Represents an actor created by `fromPromise`.
The type of `self` within the actor's logic.

```ts
type PromiseActorRef<TOutput> = ActorRefFromLogic<
    PromiseActorLogic<TOutput, unknown>
>;
```

An actor logic creator which returns promise logic as defined by an async
 process that resolves or rejects after some time.
  Actors created from promise actor logic (“promise actors”) can:
Emit the resolved value of the promise
  Output the resolved value of the promise
 Sending events to promise actors will have no effect.

### onError

- Transitions when invoked actor throws an error, or (for Promise-based actors) when the promise rejects
- Event object `error` property is provided with actor’s error data

The `onError` transition can be an object:

```ts
invoke: {
  src: 'getUser',
  onError: {
    target: 'failure',
    actions: ({ event }) => {
      console.error(event.error);
    }
  }
}
```

```ts
// Or, for simplicity, target-only transitions can be strings:
{
  invoke: {
    src: 'getUser',
    onError: 'failure'
  }
}
```

