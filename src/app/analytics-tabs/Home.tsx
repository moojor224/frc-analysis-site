import { Page } from "@/types.js";
import HomeIcon from "@mui/icons-material/Home";
import { Tabs } from "../page.js";

const name = Tabs.Home;

function Homepage() {
    return "placeholder home page";
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
