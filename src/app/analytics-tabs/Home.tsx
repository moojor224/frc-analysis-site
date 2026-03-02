import { Tabs } from "@/lib/lib";
import type { Page } from "@/types";
import HomeIcon from "@mui/icons-material/Home";
import { Box } from "@mui/material";

const name = Tabs.Home;

function Homepage() {
    return <Box>{/* <ZoomControls /> */}</Box>;
}

export default {
    icon: <HomeIcon />,
    name: name,
    TabSelect({ tab }: { tab: string }) {
        return (
            <div hidden={tab != name} style={{ height: "100%" }}>
                <Homepage />
            </div>
        );
    },
    Component: Homepage
} satisfies Page;
