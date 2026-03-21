import { PersistPrefixKeyContext } from "@/app/page";
import { useStoredValue } from "@moojor224/react-hooks";
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
    const [value, setValue] = useStoredValue<T | undefined>(prefix + "-value", undefined);
    const [has, setHas] = useStoredValue(prefix + "-has", false);
    const [errorMessage, setErrorMessage] = useStoredValue(prefix + "-errorMessage", "");
    const [hasError, setHasError] = useStoredValue(prefix + "-hasError", false);
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
