import { Actor,  AnyActorRef, ActorOptions, AnyStateMachine, StateFrom, Observer, AnyActorLogic, SnapshotFrom, type ConditionalRequired, type IsNotNever, type RequiredActorOptionsKeys } from 'xstate';
import * as React from 'react';

export declare function createActorContext<TLogic extends AnyActorLogic>(actorLogic: TLogic, actorOptions?: ActorOptions<TLogic>): {
    useSelector: <T>(selector: (snapshot: SnapshotFrom<TLogic>) => T, compare?: (a: T, b: T) => boolean) => T;
    useActorRef: () => Actor<TLogic>;
    Provider: (props: {
        children: React.ReactNode;
        options?: ActorOptions<TLogic>;
        /** @deprecated Use `logic` instead. */
        machine?: never;
        logic?: TLogic;
    }) => React.ReactElement<any, any>;
};

export declare function useIdleActorRef<TLogic extends AnyActorLogic>(logic: TLogic, ...[options]: ConditionalRequired<[
    options?: ActorOptions<TLogic> & {
        [K in RequiredActorOptionsKeys<TLogic>]: unknown;
    }
], IsNotNever<RequiredActorOptionsKeys<TLogic>>>): Actor<TLogic>;
export declare function useActorRef<TLogic extends AnyActorLogic>(machine: TLogic, ...[options, observerOrListener]: IsNotNever<RequiredActorOptionsKeys<TLogic>> extends true ? [
    options: ActorOptions<TLogic> & {
        [K in RequiredActorOptionsKeys<TLogic>]: unknown;
    },
    observerOrListener?: Observer<SnapshotFrom<TLogic>> | ((value: SnapshotFrom<TLogic>) => void)
] : [
    options?: ActorOptions<TLogic>,
    observerOrListener?: Observer<SnapshotFrom<TLogic>> | ((value: SnapshotFrom<TLogic>) => void)
]): Actor<TLogic>;



export declare function useActor<TLogic extends AnyActorLogic>(logic: TLogic, ...[options]: ConditionalRequired<[
    options?: ActorOptions<TLogic> & {
        [K in RequiredActorOptionsKeys<TLogic>]: unknown;
    }
], IsNotNever<RequiredActorOptionsKeys<TLogic>>>): [SnapshotFrom<TLogic>, Actor<TLogic>['send'], Actor<TLogic>];

export declare function shallowEqual(objA: any, objB: any): boolean;


/** @alias useActor */
export declare function useMachine<TMachine extends AnyStateMachine>(machine: TMachine, ...[options]: ConditionalRequired<[
    options?: ActorOptions<TMachine> & {
        [K in RequiredActorOptionsKeys<TMachine>]: unknown;
    }
], IsNotNever<RequiredActorOptionsKeys<TMachine>>>): [StateFrom<TMachine>, Actor<TMachine>['send'], Actor<TMachine>];


export declare function useSelector<TActor extends Pick<AnyActorRef, 'subscribe' | 'getSnapshot'> | undefined, T>(actor: TActor, selector: (snapshot: TActor extends {
    getSnapshot(): infer TSnapshot;
} ? TSnapshot : undefined) => T, compare?: (a: T, b: T) => boolean): T;
