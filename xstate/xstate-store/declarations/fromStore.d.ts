import { ActorLogic } from 'xstate';
import { EventPayloadMap, StoreContext, StoreSnapshot, EventObject, ExtractEvents, StoreAssigner } from "./types.js";
type StoreLogic<TContext extends StoreContext, TEvent extends EventObject, TInput, TEmitted extends EventObject> = ActorLogic<StoreSnapshot<TContext>, TEvent, TInput, any, TEmitted>;
/**
 * An actor logic creator which creates store [actor
 * logic](https://stately.ai/docs/actors#actor-logic) for use with XState.
 *
 * @param config An object containing the store configuration
 * @param config.context The initial context for the store, either a function
 *   that returns context based on input, or the context itself
 * @param config.on An object defining the transitions for different event types
 * @param config.emits Optional object to define emitted event handlers
 * @returns An actor logic creator function that creates store actor logic
 */
export declare function fromStore<TContext extends StoreContext, TEventPayloadMap extends EventPayloadMap, TInput, TEmitted extends EventPayloadMap>(config: {
    context: ((input: TInput) => TContext) | TContext;
    on: {
        [K in keyof TEventPayloadMap & string]: StoreAssigner<NoInfer<TContext>, {
            type: K;
        } & TEventPayloadMap[K], ExtractEvents<TEmitted>>;
    };
    emits?: {
        [K in keyof TEmitted & string]: (payload: {
            type: K;
        } & TEmitted[K]) => void;
    };
}): StoreLogic<TContext, ExtractEvents<TEventPayloadMap>, TInput, ExtractEvents<TEmitted>>;
export {};
