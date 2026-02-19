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
                const apiKey = localStorage.getItem("persist-API_KEY");
                db.clear("");
                localstorageAdapter.clear("");
                if (confirm("Do you want to keep the API key?")) {
                    localStorage.setItem("persist-API_KEY", apiKey ?? "");
                }
                location.reload();
            }}
            sx={{ textTransform: "none" }}
        >
            Clear all app data
        </Button>
    );
}
