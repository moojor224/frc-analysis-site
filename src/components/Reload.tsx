import { DBContext } from "@/lib/useDBPersistentValue";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Button } from "@mui/material";
import { useContext, useState } from "react";
export default function Reload() {
    const db = useContext(DBContext);
    const [reload, setReload] = useState(false);
    if (reload && db.workSize == 0) {
        location.reload();
    }
    return (
        <Button onClick={() => setReload(true)}>
            <RefreshIcon />
        </Button>
    );
}
