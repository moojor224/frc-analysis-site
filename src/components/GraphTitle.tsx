import { Typography } from "@mui/material";

export default function GraphTitle({ text }: { text: string }) {
    return (
        <Typography variant="h5" textAlign="center">
            {text}
        </Typography>
    );
}
