import { useState } from "react";

type Input<T> = {
    readonly has: boolean;
    readonly value: T | undefined;
    set(value: T | undefined): void;
    readonly errorMessage: string;
    readonly hasError: boolean;
    setError(message: string): void;
};

export function useInput<T>() {
    const [value, setValue] = useState<T | undefined>(undefined);
    const [has, setHas] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [hasError, setHasError] = useState(false);
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
