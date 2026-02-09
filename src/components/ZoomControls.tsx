import { useLSPersistentValue } from "@/lib/useLSPersistentValue.js";
import { persistValue } from "@moojor224/persistent-value";
import { Box, Button, Grid, Stack } from "@mui/material";
import { useState } from "react";

export default function ZoomControls() {
    const [zoom, setZoom] = useLSPersistentValue("pagezoom", 1);
    document.body.style.setProperty("--zoom", String(zoom));
    return (
        <Box>
            <Stack>
                <Box display="flex" justifyContent="center">
                    Zoom
                </Box>
                <Grid container>
                    <Button variant="outlined" onClick={() => setZoom(zoom > 0 ? zoom - 0.1 : 0)}>
                        -
                    </Button>
                    <Box flexGrow={1} display="flex" alignItems="center" justifyContent="center">
                        {zoom.toFixed(1)}
                    </Box>
                    <Button variant="outlined" onClick={() => setZoom(zoom + 0.1)}>
                        +
                    </Button>
                </Grid>
            </Stack>
        </Box>
    );
}
