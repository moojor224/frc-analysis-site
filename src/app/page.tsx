import { persistValue } from "@moojor224/persistent-value";
import MenuIcon from "@mui/icons-material/Menu";
import {
    AppBar,
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Typography
} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "react-tabs/style/react-tabs.css";
import { ApiContext, TBAAPI } from "../lib/tba_api/index.js";
import { TBALogo } from "../components/tba_lamp.js";
import { analytics } from "./analytics-tabs/index.js";
import "./styles.css";
import PWA from "@/components/PWA.js";

const darkTheme = createTheme({
    palette: {
        mode: "dark"
        // primary: { // TBA theme color
        //     main: "#1565c0",
        //     dark: "#1565c0"
        // }
    }
});

const key = await persistValue({
    acquireMessage: "Enter a TBA API key. API keys can be generated here: https://www.thebluealliance.com/account",
    acquireValue(message) {
        return prompt(message);
    },
    key: "API_KEY",
    optional: false,
    validator(value) {
        return typeof value === "string" && (!!value.match(/[a-zA-Z0-9]{32,100}/) || value === "dev");
    }
});

if (!key.has()) {
    throw new Error("no api key");
}
if (key.get() === "dev") {
    key.set("aFw9aPt0QvDsBNKIicgTBrmJvFKbCwyBeBeKmWwfjnyjbZbcSgLLfUzKawbRGi3w");
}
const API_KEY = key.get()!;

export enum Tabs {
    Season = "Season Analysis",
    Event = "Event Analysis"
}

function TabSelect({ tab }: { tab: Tabs }) {
    return (
        <>
            {analytics.map((e, i) => (
                <e.TabSelect key={i} tab={tab} />
            ))}
        </>
    );
}

function Sidebar({ setActiveTab }: { setActiveTab: (value: Tabs) => void }) {
    return (
        <List>
            {analytics.map((e, i) => (
                <SidebarItem icon={e.icon} text={e.name} onClick={(e) => setActiveTab(e)} />
            ))}
        </List>
    );
}

function SidebarItem<T>({ text, icon, onClick }: { text: T; icon: React.ReactNode; onClick: (id: T) => void }) {
    return (
        <ListItem disablePadding>
            <ListItemButton onClick={() => onClick(text)}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text + ""} />
            </ListItemButton>
        </ListItem>
    );
}
("#1565c0"); // primary dark

function Home() {
    const [loaded, setLoaded] = useState(false);
    const [loadMessage, setLoadMessage] = useState("Loading...");
    const [showSidebar, setShowSidebar] = useState(false);
    const [activeTab, setActiveTab] = useState(Tabs.Event);

    const api = useMemo(() => {
        const api = new TBAAPI(API_KEY);
        if (!key.has()) {
            return api;
        }
        api.on("load", () => {
            setLoadMessage("");
            setLoaded(true);
        });
        api.on("loaderror", () => {
            setLoadMessage("API Not accessible. Check internet connection");
        });
        return api;
    }, []);
    return (
        <>
            <ThemeProvider theme={darkTheme}>
                {/* provide api to all children */}
                <ApiContext value={api}>
                    <CssBaseline />
                    <Drawer open={loaded && showSidebar} onClose={() => setShowSidebar(false)}>
                        <Sidebar {...{ setActiveTab }} />
                        <Divider />
                        <Box flexGrow={1} />
                        <Stack alignItems="center">
                            <Typography variant="h6" component="div" display={"inline-flex"} alignItems={"center"}>
                                Powered by:
                            </Typography>
                            <TBALogo />
                        </Stack>
                    </Drawer>
                    <Stack sx={{ height: "100%" }}>
                        <Box>
                            <AppBar position="static">
                                <Toolbar>
                                    <IconButton
                                        size="large"
                                        edge="start"
                                        color="inherit"
                                        aria-label="menu"
                                        sx={{ mr: 2 }}
                                        onClick={() => setShowSidebar(true)}
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                        {activeTab}
                                    </Typography>
                                    {/* TODO: api key button? */}
                                    {/* <Button color="inherit">API Key</Button> */}
                                    <PWA />
                                </Toolbar>
                            </AppBar>
                        </Box>
                        {loaded ? (
                            // don't render site until api has loaded
                            <Box id="body" sx={{ flexGrow: 1, minHeight: "0" }}>
                                <TabSelect tab={activeTab} />
                            </Box>
                        ) : (
                            <Box>
                                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                    {loadMessage}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </ApiContext>
            </ThemeProvider>
        </>
    );
}

ReactDOM.createRoot(document.querySelector("#root")!).render(React.createElement(Home));

function other() {
    const MIN_YEAR = 1992; // oldest year on TBA website
    const [MAX_YEAR, setMaxYear] = useState(MIN_YEAR); // max year
    const arr = useMemo(
        () =>
            new Array(MAX_YEAR - MIN_YEAR + 1)
                .fill(0)
                .map((e, i) => i + MIN_YEAR)
                .reverse(),
        [MAX_YEAR]
    );
    <select>
        {arr.map((e, i) => (
            <option key={i} value={e}>
                {e}
            </option>
        ))}
    </select>;
}
