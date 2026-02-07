import { Button } from "@mui/material";
import { useEffect, useState } from "react";

export default function PWA() {
    const [canPWA, setCanPWA] = useState(false);
    const [event, setEvent] = useState<(Event & { prompt(): void }) | null>(null);
    useEffect(() => {
        window.addEventListener("beforeinstallprompt", function (e) {
            console.debug("app is valid pwa");
            if (location.protocol === "https:" || location.hostname === "localhost") {
                setCanPWA(true);
                setEvent(e as any);
            }
        });
    }, []);
    return (
        <Button sx={{ display: canPWA ? "block" : "none" }} onClick={() => event?.prompt?.()} variant="outlined">
            Install as app
        </Button>
    );
}
