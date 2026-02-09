import { StoreContext } from "@/components/IndexedDB.js";
import { useContext, useState } from "react";

function valueOrDefault<T>(val: T | null | undefined, def: T) {
    if (val === null || val === undefined) {
        console.log("valueordefault default", val, def);
        return def;
    }
    console.log("valueordefault value", val, def);
    return val;
}

export function usePersistentValue<T>(key: string, initialValue: T) {
    const store = useContext(StoreContext);
    const [stateVal, setStateVal] = useState(() => {
        console.log("initialize", key);
        const val = valueOrDefault(store.getValue<T>(key), initialValue);
        store.setValue(key, val);
        return val;
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
            console.log("set store value", key, v);
            store.setValue(key, v);
            setStateVal(v);
        }
    ] as const;
}
