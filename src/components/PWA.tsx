import { Button } from "@mui/material";
import { useEffect, useState } from "react";

export default function PWA() {
    const [canPWA, setCanPWA] = useState(false);
    const [event, setEvent] = useState<(Event & { prompt(): void }) | null>(null);
    const [update, setUpdate] = useState(0);
    useEffect(() => {
        // @ts-ignore
        window.onbeforeinstallprompt = function (e: any) {
            // console.debug("app is valid pwa");
            if (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1") {
                console;
                setCanPWA(true);
                setEvent(e);
            }
        };
        const interval = setInterval(() => {
            let displayMode = "browser";
            const mqStandAlone = "(display-mode: standalone)";
            if ("standalone" in navigator || window.matchMedia(mqStandAlone).matches) {
                displayMode = "standalone";
            }
            if (displayMode == "standalone") {
                console.info("pwa detected. standing down");
                setCanPWA(false);
                clearInterval(interval);
            }
        }, 500);
    }, []);
    return (
        <Button
            sx={{ display: canPWA ? "block" : "none" }}
            onClick={() => {
                event?.prompt?.();
                setUpdate(update + 1);
            }}
            variant="outlined"
        >
            Install as app
        </Button>
    );
}
