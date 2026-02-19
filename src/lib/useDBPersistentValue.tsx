import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type DB =
    | {
          ready: true;
          database: IDBDatabase;
          error: boolean;
      }
    | {
          ready: false;
          database: null;
          error: boolean;
      };

/** sets up connection to IDB */
function useIndexedDB(dbName: string, storeName: string, version: number): DB {
    const [db, setDB] = useState<IDBDatabase | null>(null);
    const [error, setError] = useState(false);
    useEffect(() => {
        // effect runs once on mount
        const request = indexedDB.open(dbName, version); // request open db
        request.onupgradeneeded = function () {
            // if successfully opened
            request.result.createObjectStore(storeName); // create app's object store
            console.info("successfully created IDB and object store");
        };
        request.onsuccess = function () {
            setDB(request.result);
            console.info("successfully connected to db");
        };
        request.onerror = function () {
            setError(true);
        };
    }, []);
    return {
        /** true if database is ready */
        ready: !!db,
        /** the database */
        database: db,
        /** whether the db init failed */
        error
    } as DB;
}

/** downloads database into cache object */
function useDBCache(db: IDBDatabase | null, storeName: string) {
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const cache: Record<string, any> = useMemo(() => ({}), []);

    useEffect(() => {
        if (initialized || !db) return;
        const tr = db.transaction(storeName, "readwrite");
        const store = tr.objectStore(storeName);
        // store.put("value", "key");
        const keyreq = store.getAllKeys();
        keyreq.onerror = function () {
            setError(keyreq.error);
        };
        keyreq.onsuccess = function () {
            const keys = keyreq.result.map((e) => e.toString());
            Promise.allSettled<{ key: string; value: any }>(
                keys.map(
                    (e) =>
                        new Promise((resolve, reject) => {
                            const getreq = store.get(e);
                            getreq.onsuccess = function () {
                                resolve({ key: e, value: getreq.result });
                            };
                            getreq.onerror = function () {
                                reject();
                            };
                        })
                )
            ).then((values) => {
                values.forEach((v) => {
                    if (v.status === "fulfilled") {
                        cache[v.value.key] = v.value.value;
                    }
                });
                setInitialized(true);
            });
        };
    }, [db, initialized]);
    return {
        initialized,
        cache,
        error
    };
}

type DBAdapter = {
    ready: boolean;
    error: boolean;
    getValue<T>(key: string): T;
    setValue(key: string, value: any): void;
    deleteValue(key: string): void;
    clear(prefix: string): void;
};

/** getters/setters for IDB cache */
function useDBCacheAdapter(dbName: string, storeName: string): DBAdapter {
    const database = useIndexedDB(dbName, storeName, 1);
    const cache = useDBCache(database.database, storeName);
    return {
        ready: database.ready && cache.initialized,
        error: database.error || !!cache.error,
        getValue<T>(key: string): T {
            return cache.cache[key];
        },
        setValue(key: string, value: any) {
            cache.cache[key] = value;
            localCache[key] = value;
            const tr = database.database!.transaction(storeName, "readwrite");
            const store = tr.objectStore(storeName);
            const setReq = store.put(value, key);
            setReq.onsuccess = function () {};
            setReq.onerror = function () {
                console.error(setReq.error);
            };
        },
        deleteValue(key: string) {
            delete cache.cache[key];
            delete localCache[key];
            const tr = database.database!.transaction(storeName, "readwrite");
            const store = tr.objectStore(storeName);
            const delReq = store.delete(key);
            delReq.onsuccess = function () {};
            delReq.onerror = function () {
                console.error(delReq.error);
            };
        },
        clear(prefix: string) {
            Object.keys(cache.cache).forEach((k) => {
                if (k.startsWith(prefix)) {
                    this.deleteValue(k);
                }
            });
        }
    };
}

const localCache: Record<string, any> = {};
const localAdapter = {
    ready: true,
    error: false,
    getValue<T>(key: string): T {
        return localCache[key];
    },
    setValue(key: string, value: any) {
        localCache[key] = value;
    },
    deleteValue(key: string) {
        delete localCache[key];
    },
    clear(prefix: string) {
        Object.keys(localCache).forEach((k) => {
            if (k.startsWith(prefix)) {
                this.deleteValue(k);
            }
        });
    }
};
/** context supplier ro DB cache. defaults to local cache */
export const DBContext = createContext<DBAdapter>(localAdapter);

let count = 0;
/** wrapper that only renders children when dbadapter is ready */
export function DBContextProvider({
    dbName,
    storeName,
    children,
    wait = true,
    Fallback = function ({ dbAdapter }) {
        return (
            <div>
                <div>Waiting for database:</div>
                <div>DB ready: {dbAdapter.ready + ""}</div>
                <div>DB error: {dbAdapter.error + ""}</div>
            </div>
        );
    }
}: {
    /** the name of the database */
    dbName: string;
    /** the name of the object store */
    storeName: string;
    children?: React.ReactNode;
    /**
     * if true or not specified, will not render child nodes until the DB is initialized
     *
     * if false. will render child nodes immediately and fallback to the local cache for object storage\
     * if the database finishes initializing later on, all changes made to the local cache will be synced to the database
     */
    wait?: boolean;
    /** fallback component to render if database is not initialized and `wait` is true or not specified */
    Fallback?: React.FunctionComponent<{ dbAdapter: DBAdapter }>;
}) {
    if (count > 10) {
        debugger;
        count = 0;
    }
    count++;
    const dbAdapter = useDBCacheAdapter(dbName, storeName);
    if (dbAdapter.ready) {
        return <DBContext value={dbAdapter}>{children}</DBContext>;
    }
    if (dbAdapter.error || !wait) {
        // this will cause all useContext(DBContext) to resolve to the fallback value of a local cache
        return <>{children}</>;
    }
    return <Fallback {...{ dbAdapter }} />;
}

function valueOrDefault<T>(val: T | null | undefined, def: T) {
    if (val === null || val === undefined) {
        return {
            usedDefault: true,
            value: def
        };
    }
    return {
        usedDefault: false,
        value: val
    };
}

export function useDBPersistentValue<T>(key: string, initialValue: T) {
    const dbAdapter = useContext(DBContext);
    const [stateVal, setStateVal] = useState(() => {
        const val = valueOrDefault(dbAdapter.getValue<T>(key), initialValue);
        if (val.usedDefault) {
            dbAdapter.setValue(key, val.value);
        }
        return val.value;
    });
    return [
        stateVal,
        function (arg0: T | ((last: T) => T)) {
            let v: T;
            if (typeof arg0 == "function") {
                v = (arg0 as (last: T) => T)(stateVal);
            } else {
                v = arg0;
            }
            dbAdapter.setValue(key, v);
            setStateVal(v);
        }
    ] as const;
}
