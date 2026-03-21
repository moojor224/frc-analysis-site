import { useStoredValue } from "@moojor224/react-hooks";
import { Box, Button, Grid, Stack } from "@mui/material";

export default function ZoomControls() {
    const [zoom, setZoom] = useStoredValue("pagezoom", 1);
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
