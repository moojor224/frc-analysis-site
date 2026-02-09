import { Box, Button, Grid } from "@mui/material";
import { useState } from "react";

export default function ZoomControls() {
    const [zoom, setZoom] = useState(1);
    document.body.style.setProperty("--zoom", String(zoom));
    return (
        <Box>
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
        </Box>
    );
}
