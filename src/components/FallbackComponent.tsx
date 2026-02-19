import { Alert } from "@mui/material";

export default function FallbackComponent({ error }: { error: unknown }) {
    let message = "An unknown error has occurred";
    if (error instanceof Error) {
        message = error.message;
    }
    return <Alert severity="error">{message}</Alert>;
}
