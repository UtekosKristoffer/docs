import { Atom, AtomOptions, Readable, ReadonlyAtom } from "./types.js";
type AsyncAtomState<Data, Error = unknown> = {
    status: 'pending';
} | {
    status: 'done';
    data: Data;
} | {
    status: 'error';
    error: Error;
};
export declare function createAsyncAtom<T>(getValue: () => Promise<T>, options?: AtomOptions<AsyncAtomState<T>>): ReadonlyAtom<AsyncAtomState<T>>;
export declare function createAtom<T>(getValue: (read: <U>(atom: Readable<U>) => U) => T, options?: AtomOptions<T>): ReadonlyAtom<T>;
export declare function createAtom<T>(initialValue: T, options?: AtomOptions<T>): Atom<T>;
export {};
