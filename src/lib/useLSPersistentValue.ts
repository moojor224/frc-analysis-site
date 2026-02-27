import { useState } from "react";

type PersistOptions<T> = {
    key: string;
    acquireValue: () => T;
};

type ExtraPersistOptions<T> = {
    value: T | null;
};

const values: Record<string, PersistOptions<any> & ExtraPersistOptions<any>> = {};

export interface StorageAdapter<T> {
    hasItem(key: string): boolean;
    getItem(key: string): T | null;
    setItem(key: string, value: T): void;
}
export type PersistentValue<T> = {
    /** get the current value */
    get(): T;
    /** set the value */
    set(value: T): void;
};

export const localstorageAdapter = {
    hasItem(key: string): boolean {
        const val = localStorage.getItem(key);
        const keyExists = val !== null;
        try {
            if (keyExists) {
                JSON.parse(val);
                return true;
            }
        } catch {
            console.warn("hasItem: stored value is invalid: ", key, val);
        }
        return false;
    },
    getItem(key: string): any | null {
        const value = localStorage.getItem(key);
        if (value === null) {
            return null;
        }
        try {
            return JSON.parse(value);
        } catch {
            console.warn("getItem: stored value is invalid: ", key, value);
            return null;
        }
    },
    setItem(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify(value));
    },
    clear(prefix: string) {
        const keys = new Array(localStorage.length).fill(0).map((e, i) => localStorage.key(i)!);
        keys.forEach((e) => {
            if (e.startsWith(prefix)) {
                localStorage.removeItem(e);
            }
        });
    }
};

function persistValue<T>(
    options: PersistOptions<T>,
    storageAdapter: StorageAdapter<T> = localstorageAdapter
): PersistentValue<T> {
    const storageKey = options.key;
    let opts: (typeof values)[string];
    if (values[options.key]) {
        opts = values[options.key]; // gets the already-created PVal
    } else {
        // create a new PVal. this should only run once when the page loads
        opts = {
            ...options,
            value: options.acquireValue()
        };
        values[options.key] = opts;
        if (storageAdapter.hasItem(storageKey)) {
            opts.value = storageAdapter.getItem(storageKey); // read saved value if cached value is null (storage value will be null if no value saved)
        } else {
            storageAdapter.setItem(storageKey, opts.value);
        }
    }
    return {
        get: () => opts.value,
        set: (value) => {
            storageAdapter.setItem(storageKey, value);
            opts.value = value;
        }
    };
}

/** create a persistent state value in localStorage */
export function useLSPersistentValue<T>(key: string, initialValue: T) {
    const val = persistValue<T>({
        acquireValue: () => initialValue,
        key
    });
    const [stateVal, setStateVal] = useState(val.get());
    return [
        stateVal,
        function (arg0: T | ((last: T) => T)) {
            let v: T;
            if (typeof arg0 == "function") {
                v = (arg0 as (last: T) => T)(stateVal);
            } else {
                v = arg0;
            }
            val.set(v);
            setStateVal(v);
        }
    ] as const;
}
