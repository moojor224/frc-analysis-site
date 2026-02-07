import { Alert } from "@mui/material";

export default function ApiError({ error }: { error: Error }) {
    return <Alert severity="error">Error in API call: {error.message}</Alert>;
}
