import { PersistPrefixKeyContext } from "@/app/page";
import { useDBPersistentValue } from "@/lib/useDBPersistentValue";
import { useContext } from "react";

type Input<T> = {
    readonly has: boolean;
    readonly value: T | undefined;
    set(value: T | undefined): void;
    readonly errorMessage: string;
    readonly hasError: boolean;
    setError(message: string): void;
};

export function useInput<T>() {
    const prefix = useContext(PersistPrefixKeyContext);
    const [value, setValue] = useDBPersistentValue<T | undefined>(prefix + "-value", undefined);
    const [has, setHas] = useDBPersistentValue(prefix + "-has", false);
    const [errorMessage, setErrorMessage] = useDBPersistentValue(prefix + "-errorMessage", "");
    const [hasError, setHasError] = useDBPersistentValue(prefix + "-hasError", false);
    const input = {
        has,
        value,
        set(value) {
            setValue(value);
            setHas(!(!value && value !== false));
        },
        hasError,
        errorMessage,
        setError(message) {
            setErrorMessage(message);
            setHasError(message.length > 0);
        }
    } satisfies Input<T>;
    return input;
}
