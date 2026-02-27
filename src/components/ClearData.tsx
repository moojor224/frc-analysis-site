import { DBContext } from "@/lib/useDBPersistentValue.js";
import { Button } from "@mui/material";
import { useContext, useState } from "react";

export default function ClearData() {
    const db = useContext(DBContext);
    const [reload, setReload] = useState(false);
    if (reload && db.workSize == 0) {
        location.reload();
    }
    return (
        <Button
            onClick={function () {
                if (!confirm("This will delete all app data including the API key. Are you sure?")) return;
                const apiKey = localStorage.getItem("persist-API_KEY");
                db.clear("");
                if (confirm("Do you want to keep the API key?")) {
                    localStorage.setItem("persist-API_KEY", apiKey ?? "");
                }
                setReload(true);
            }}
            sx={{ textTransform: "none" }}
        >
            Clear all app data
        </Button>
    );
}
