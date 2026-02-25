import RefreshIcon from "@mui/icons-material/Refresh";
import { Button } from "@mui/material";
export default function Reload() {
    return (
        <Button onClick={() => location.reload()}>
            <RefreshIcon />
        </Button>
    );
}
