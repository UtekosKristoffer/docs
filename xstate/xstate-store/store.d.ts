import { EnqueueObject, EventObject, EventPayloadMap, ExtractEvents, Store, StoreAssigner, StoreContext, StoreConfig, StoreSnapshot, StoreLogic, StoreTransition, SpecificStoreConfig } from "./types.js";
export type TransitionsFromEventPayloadMap<TEventPayloadMap extends EventPayloadMap, TContext extends StoreContext, TEmitted extends EventObject> = {
    [K in keyof TEventPayloadMap & string]: StoreAssigner<TContext, {
        type: K;
    } & TEventPayloadMap[K], TEmitted>;
};
/**
 * Creates a **store** that has its own internal state and can be sent events
 * that update its internal state based on transitions.
 *
 * @example
 *
 * ```ts
 * const store = createStore({
 *   context: { count: 0, name: 'Ada' },
 *   on: {
 *     inc: (context, event: { by: number }) => ({
 *       ...context,
 *       count: context.count + event.by
 *     })
 *   }
 * });
 *
 * store.subscribe((snapshot) => {
 *   console.log(snapshot);
 * });
 *
 * store.send({ type: 'inc', by: 5 });
 * // Logs { context: { count: 5, name: 'Ada' }, status: 'active', ... }
 * ```
 *
 * @param config - The store configuration object
 * @param config.context - The initial state of the store
 * @param config.on - An object mapping event types to transition functions
 * @param config.emits - An object mapping emitted event types to handlers
 * @returns A store instance with methods to send events and subscribe to state
 *   changes
 */
export declare function createStore<TContext extends StoreContext, TEventPayloadMap extends EventPayloadMap, TEmittedPayloadMap extends EventPayloadMap>(definition: StoreConfig<TContext, TEventPayloadMap, TEmittedPayloadMap>): Store<TContext, ExtractEvents<TEventPayloadMap>, ExtractEvents<TEmittedPayloadMap>>;
export declare function createStore<TContext extends StoreContext, TEvent extends EventObject, TEmitted extends EventObject>(definition: SpecificStoreConfig<TContext, TEvent, TEmitted> | StoreLogic<StoreSnapshot<TContext>, TEvent, TEmitted>): Store<TContext, TEvent, TEmitted>;
export declare const createStoreConfig: {
    <TContext extends StoreContext, TEventPayloadMap extends EventPayloadMap, TEmitted extends EventPayloadMap>(definition: StoreConfig<TContext, TEventPayloadMap, TEmitted>): StoreConfig<TContext, TEventPayloadMap, TEmitted>;
    <TContext extends StoreContext, TEventPayloadMap extends EventPayloadMap, TEmitted extends EventPayloadMap>(definition: StoreConfig<TContext, TEventPayloadMap, TEmitted>): StoreConfig<TContext, TEventPayloadMap, TEmitted>;
};
/**
 * Creates a `Store` with a provided producer (such as Immer's `producer(…)` A
 * store has its own internal state and can receive events.
 *
 * @example
 *
 * ```ts
 * import { produce } from 'immer';
 *
 * const store = createStoreWithProducer(produce, {
 *   context: { count: 0 },
 *   on: {
 *     inc: (context, event: { by: number }) => {
 *       context.count += event.by;
 *     }
 *   }
 * });
 *
 * store.subscribe((snapshot) => {
 *   console.log(snapshot);
 * });
 *
 * store.send({ type: 'inc', by: 5 });
 * // Logs { context: { count: 5 }, status: 'active', ... }
 * ```
 */
export declare function createStoreWithProducer<TContext extends StoreContext, TEventPayloadMap extends EventPayloadMap, TEmittedPayloadMap extends EventPayloadMap>(producer: NoInfer<(context: TContext, recipe: (context: TContext) => void) => TContext>, config: {
    context: TContext;
    on: {
        [K in keyof TEventPayloadMap & string]: (context: NoInfer<TContext>, event: {
            type: K;
        } & TEventPayloadMap[K], enqueue: EnqueueObject<ExtractEvents<TEmittedPayloadMap>>) => void;
    };
    emits?: {
        [K in keyof TEmittedPayloadMap & string]: (payload: TEmittedPayloadMap[K]) => void;
    };
}): Store<TContext, ExtractEvents<TEventPayloadMap>, ExtractEvents<TEmittedPayloadMap>>;
declare global {
    interface SymbolConstructor {
        readonly observable: symbol;
    }
}
/**
 * Creates a store transition function that handles state updates based on
 * events.
 *
 * @param transitions - An object mapping event types to transition functions
 * @param producer - Optional producer function (e.g., Immer's produce) for
 *   immutable updates
 * @returns A transition function that takes a snapshot and event and returns a
 *   new snapshot with effects
 */
export declare function createStoreTransition<TContext extends StoreContext, TEventPayloadMap extends EventPayloadMap, TEmitted extends EventObject>(transitions: {
    [K in keyof TEventPayloadMap & string]: StoreAssigner<TContext, {
        type: K;
    } & TEventPayloadMap[K], TEmitted>;
}, producer?: (context: TContext, recipe: (context: TContext) => void) => TContext): StoreTransition<TContext, ExtractEvents<TEventPayloadMap>, TEmitted>;
