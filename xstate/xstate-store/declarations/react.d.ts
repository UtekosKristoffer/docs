import { StoreContext, EventPayloadMap, StoreConfig, Store, ExtractEvents, Readable, BaseAtom, StoreSnapshot } from "./types.js";
/**
 * A React hook that subscribes to the `store` and selects a value from the
 * store's snapshot, with an optional compare function.
 *
 * @example
 *
 * ```ts
 * function Component() {
 *   const count = useSelector(store, (s) => s.count);
 *
 *   return <div>{count}</div>;
 * }
 * ```
 *
 * @param store The store, created from `createStore(…)`
 * @param selector A function which takes in the `snapshot` and returns a
 *   selected value
 * @param compare An optional function which compares the selected value to the
 *   previous value
 * @returns The selected value
 */
export declare function useSelector<TStore extends Readable<any>, T>(store: TStore, selector: (snapshot: TStore extends Readable<infer T> ? T : never) => T, compare?: (a: T | undefined, b: T) => boolean): T;
export declare const useStore: {
    <TContext extends StoreContext, TEventPayloadMap extends EventPayloadMap, TEmitted extends EventPayloadMap>(definition: StoreConfig<TContext, TEventPayloadMap, TEmitted>): Store<TContext, ExtractEvents<TEventPayloadMap>, ExtractEvents<TEmitted>>;
    <TContext extends StoreContext, TEventPayloadMap extends EventPayloadMap, TEmitted extends EventPayloadMap>(definition: StoreConfig<TContext, TEventPayloadMap, TEmitted>): Store<TContext, ExtractEvents<TEventPayloadMap>, ExtractEvents<TEmitted>>;
};
/**
 * A React hook that subscribes to the `atom` and returns the current value of
 * the atom.
 *
 * @example
 *
 * ```ts
 * const atom = createAtom(0);
 *
 * const Component = () => {
 *   const count = useAtom(atom);
 *
 *   return (
 *     <div>
 *       <div>{count}</div>
 *       <button onClick={() => atom.set((c) => c + 1)}>Increment</button>
 *     </div>
 *   );
 * };
 * ```
 *
 * @param atom The atom, created from `createAtom(…)`
 * @param selector An optional function which takes in the `snapshot` and
 *   returns a selected value
 * @param compare An optional function which compares the selected value to the
 *   previous value
 */
export declare function useAtom<T>(atom: BaseAtom<T>): T;
export declare function useAtom<T, S>(atom: BaseAtom<T>, selector: (snapshot: T) => S, compare?: (a: S, b: S) => boolean): S;
/**
 * Creates a custom hook that returns the selected value and the store from a
 * store configuration object.
 *
 * @example
 *
 * ```ts
 * const useCountStore = createStoreHook({
 *   context: { count: 0 },
 *   on: {
 *     inc: (context, event: { by: number }) => ({
 *       ...context,
 *       count: context.count + event.by
 *     })
 *   }
 * });
 *
 * function Component() {
 *   const [count, store] = useCountStore(s => s.context.count);
 *
 *   return (
 *     <div>
 *       {count}
 *       <button onClick={() => store.trigger.inc({ by: 1 })}>+</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param definition The store configuration object
 * @returns A custom hook that returns [selectedValue, store]
 */
export declare function createStoreHook<TContext extends StoreContext, TEventPayloadMap extends EventPayloadMap, TEmitted extends EventPayloadMap>(definition: StoreConfig<TContext, TEventPayloadMap, TEmitted>): {
    (): [StoreSnapshot<TContext>, Store<TContext, ExtractEvents<TEventPayloadMap>, ExtractEvents<TEmitted>>];
    <T>(selector: (snapshot: StoreSnapshot<TContext>) => T, compare?: (a: T | undefined, b: T) => boolean): [T, Store<TContext, ExtractEvents<TEventPayloadMap>, ExtractEvents<TEmitted>>];
};
