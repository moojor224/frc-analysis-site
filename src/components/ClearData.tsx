import { StorageContext } from "@moojor224/react-hooks";
import { Button } from "@mui/material";
import { useContext, useEffect, useState } from "react";

export default function ClearData() {
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
        <Button
            onClick={function () {
                if (!confirm("This will delete all app data including the API key. Are you sure?")) return;
                const apiKey = localStorage.getItem("persist-API_KEY");
                db.keys().forEach((k) => {
                    db.deleteValue(k);
                });
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
