import { Button } from "@mui/material";
import { useEffect, useState } from "react";

export default function PWA() {
    const [canPWA, setCanPWA] = useState(false);
    const [event, setEvent] = useState<(Event & { prompt(): void }) | null>(null);
    useEffect(() => {
        // @ts-ignore
        window.onbeforeinstallprompt = function (e: any) {
            console.debug("app is valid pwa");
            if (location.protocol === "https:" || location.hostname === "localhost") {
                setCanPWA(true);
                setEvent(e);
            }
        };
    }, []);
    return (
        <Button sx={{ display: canPWA ? "block" : "none" }} onClick={() => event?.prompt?.()} variant="outlined">
            Install as app
        </Button>
    );
}
