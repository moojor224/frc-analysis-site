import { Alert } from "@mui/material";

export default function FallbackComponent(msg?: string) {
    return function FallbackComponent({ error }: { error?: any }) {
        let message = "An unknown error has occurred";
        if (error instanceof Error) {
            message = error.message;
        }
        return (
            <Alert sx={{ whiteSpace: "pre" }} severity="error">
                {(msg ?? "") + "\n" + message}
            </Alert>
        );
    };
}
