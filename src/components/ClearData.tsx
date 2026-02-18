import { DBContext } from "@/lib/useDBPersistentValue.js";
import { localstorageAdapter } from "@/lib/useLSPersistentValue.js";
import { Button } from "@mui/material";
import { useContext } from "react";

export default function ClearData() {
    const db = useContext(DBContext);
    return (
        <Button
            onClick={function () {
                if (!confirm("This will delete all app data including the API key. Are you sure?")) return;
                db.clear("");
                localstorageAdapter.clear("");
                location.reload();
            }}
            sx={{ textTransform: "none" }}
        >
            Clear all app data
        </Button>
    );
}
