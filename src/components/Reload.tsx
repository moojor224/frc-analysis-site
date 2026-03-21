import { StorageContext } from "@moojor224/react-hooks";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Button } from "@mui/material";
import { useContext, useEffect, useState } from "react";

export default function Reload() {
    const db = useContext(StorageContext);
    const [reload, setReload] = useState(false);
    useEffect(() => {
        const int = setInterval(() => {
            if (reload && db.work.size == 0) {
                location.reload();
            }
        });
        return () => clearInterval(int);
    });
    return (
        <Button onClick={() => setReload(true)}>
            <RefreshIcon />
        </Button>
    );
}
