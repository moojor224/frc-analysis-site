// this file is probably the only one to be well commented because it's fairly complex and I needed the sanity checks
import React, { createContext, useEffect, useRef, useState } from "react";

type QueuedAction = {
    type: "set" | "delete" | "getkeys" | "clear" | "read";
    key: string;
    value?: any;
    working: boolean;
    finished?: (val: any) => void;
};

type DBAPI = {
    status: "pending" | "simple" | "ready";
    getValue<T>(key: string): T;
    setValue(key: string, value: any): void;
    clear(prefix: string): void;
    /** whether there was an error when connecting to the IDB */
    error: Error | null;
    workItems: number;
};
type DBRef = React.RefObject<DBAPI>;

// wrap entire app in ctx with access to simplestore
// in usePersistentValue useCtx(store) to access simplestore

const simpleStore: Record<string, any> = {};
const storeKeys = new Set<string>();
/** use this if IDB store isn't available */
const defaultSimpleStore: DBAPI = {
    status: "pending",
    getValue(key: string) {
        return simpleStore[key];
    },
    setValue(key: string, value: any) {
        simpleStore[key] = value;
    },
    clear(prefix: string) {
        Object.entries(simpleStore).forEach(([key]) => {
            if (key.startsWith(prefix)) {
                delete simpleStore[prefix];
            }
        });
    },
    error: null,
    workItems: 0
};

const DBNAME = "FRCAnalysisDB";
const STORENAME = "FRCAnalysisState";

function doWork(
    db: IDBDatabase,
    queueWork: (action: QueuedAction) => void,
    action: QueuedAction,
    _finished: (val?: any) => void
) {
    const finished = function (val?: any) {
        tr.commit();
        _finished(val);
    };
    // remove doWork and replace with these vvv
    const tr = db.transaction(STORENAME, "readwrite");
    tr.onerror = function (ev) {
        console.error("transaction error", tr.error);
    };
    const store = tr.objectStore(STORENAME);
    if (action.working) return; // prevent working same task twice
    action.working = true; // mark task as in progress
    const { key, value } = action;
    function error(req: { onerror: ((ev: Event) => void) | null; error: Error | null }) {
        // wrapper to prevent duplicate code
        req.onerror = function () {
            // pass up error, causing IDB adapter to switch to simple adapter (may not be necessary, but need absolute fallback)
            if (req.error) console.error(req.error);
        };
    }
    if (action.type == "set") {
        // set value
        storeKeys.add(key); // add key if not already exist
        const putReq = store.put(value, key); // update or insert
        putReq.onsuccess = function () {
            finished();
        };
        error(putReq);
    } else if (action.type == "delete") {
        // remove a key from the store
        const delReq = store.delete(key); // make deletion request
        delReq.onsuccess = function () {
            console.info("deleted " + key + " from store");
            finished();
        };
        storeKeys.delete(key);
        error(delReq);
    } else if (action.type == "getkeys") {
        // read all keys from store
        const req = store.getAllKeys();
        req.onsuccess = function () {
            console.log("got all keys");
            finished(req.result);
        };
        error(req);
    } else if (action.type == "clear") {
        const toBeDeleted: string[] = []; // array to store keys to be deleted
        for (const k of storeKeys) {
            // iterate over every known key in store
            if (k.startsWith(key)) {
                // key should be deleted
                toBeDeleted.push(k); // push to array
            }
        }
        toBeDeleted.forEach((e) =>
            queueWork({
                // queue action to delete each key
                type: "delete",
                key: e,
                working: false
            })
        );
        finished();
    } else if (action.type == "read") {
        console.log("reading", key);
        const read = store.get(key);
        read.onsuccess = function () {
            console.log("read got: ", read.result);
            finished(read.result);
        };
        read.onerror = function (ev) {
            console.error("read error", ev);
        };
    }
}

function IndexedDB({ ref }: { ref: DBRef }) {
    const [store, setStore] = useState(false);
    const [db, setDB] = useState<IDBDatabase | null>(null);
    const [workQueue, setWorkQueue] = useState<QueuedAction[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const [initial, setInitial] = useState(false);
    const [status, setStatus] = useState<DBAPI["status"]>("pending");

    ref.current =
        error || !db || !store // if error in IDB adapter
            ? defaultSimpleStore // use simple adapter
            : {
                  // otherwise, use IDB
                  getValue(key) {
                      // read value from local cache
                      return simpleStore[key];
                  },
                  setValue(key, value) {
                      console.debug("setting value", key, value);
                      // update value in local cache
                      simpleStore[key] = value;
                      setTimeout(() =>
                          queueWork({
                              // queue action to save value to IDB
                              type: "set",
                              key,
                              value,
                              working: false
                          })
                      );
                  },
                  clear(prefix) {
                      // clear all values whose key starts with prefix
                      queueWork({
                          type: "clear",
                          key: prefix,
                          working: false
                      });
                  },
                  status, // initial status is pending until an error occurs or everything goes fine and status becomes ready
                  error: null,
                  workItems: workQueue.length
              };
    // @ts-ignore
    window.idbstorething = ref.current;
    console.log("checking work", workQueue.length, store, !!db);
    if (workQueue.length > 0 && store && db) {
        // if work exists, do work
        // console.log("doing work");
        doWork(
            db,
            queueWork, // pass queueWork
            workQueue[0], // next available task
            (val) => {
                workQueue[0].finished?.(val); // run task cleanup callback
                workQueue.shift();
                setWorkQueue(Array.from(workQueue)); // update state with new work queue
            }
        );
    } else if (initial && workQueue.length == 0) {
        console.log("initial cleanup");
        setInitial(false);
        if (error == null) {
            setStatus("ready");
            defaultSimpleStore.status = "simple";
        }
    } else {
        console.log("no initial, no work");
    }

    function queueWork(action: QueuedAction) {
        workQueue.push(action);
        setWorkQueue(Array.from(workQueue));
    }
    if (error !== null) {
        defaultSimpleStore.error = error;
    }
    useEffect(() => {
        // effect runs once on mount
        const request = indexedDB.open(DBNAME, 1); // request open db
        request.onupgradeneeded = function () {
            // if successfully opened
            request.result.createObjectStore(STORENAME); // create app's object store
            console.info("successfully created IDB and object store");
        };
        request.onsuccess = function () {
            setDB(request.result);
            setStore(true); // update state with object store
            console.log("successfully connected to db");
            queueWork({
                // queue action to read all available keys
                key: "",
                type: "getkeys",
                working: false,
                finished(keys: IDBValidKey[]) {
                    console.log("downloading all db keys", keys);
                    setInitial(true); // update state to say "this is the initial setup"
                    const tr = request.result.transaction(STORENAME, "readwrite");
                    tr.onerror = function (ev) {
                        console.error("transaction error", tr.error);
                    };
                    const store = tr.objectStore(STORENAME);
                    keys.forEach((_k) => {
                        // iterate over every key in store
                        const k = _k.toString(); // convert to string
                        const val = store.getKey(k);
                        console.log("downloading to cache", k, val);
                        simpleStore[k] = val;
                        storeKeys.add(k);
                    });
                    setWorkQueue(Array.from(workQueue));
                }
            });
        };
        function handleError() {
            setError(request.error);
        }
        request.onerror = handleError;
        request.onblocked = handleError;
    }, []);
    return (
        <div>
            <div>work queue: {workQueue.length}</div>
            <div>store: {!!store + ""}</div>
            <div>db: {!!db + ""}</div>
            <div>status: {status}</div>
            <div>initial: {initial + ""}</div>
            <div>error: {error?.message || "null"}</div>
        </div>
    );
}

/** context to access object store */
export const StoreContext = createContext(defaultSimpleStore);
/** wrapper to include both the context and IDB initializer in one */
export default function IndexedDBContext({ children }: { children: React.ReactNode }) {
    const ref: DBRef = useRef(defaultSimpleStore);
    return (
        <>
            <IndexedDB ref={ref} />
            {ref.current.status !== "pending" ? <StoreContext value={ref.current}>{children}</StoreContext> : null}
        </>
    );
}
