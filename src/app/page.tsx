import ClearData from "@/components/ClearData.js";
import FallbackComponent from "@/components/FallbackComponent.js";
import MuiXLicense from "@/components/MuiXLicense.js";
import PWA from "@/components/PWA.js";
import Reload from "@/components/Reload.js";
import ZoomControls from "@/components/ZoomControls.js";
import { DBContextProvider } from "@/lib/useDBPersistentValue.js";
import { useLSPersistentValue } from "@/lib/useLSPersistentValue.js";
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
import React, { createContext, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import "react-tabs/style/react-tabs.css";
import { TBALogo } from "../components/tba_lamp.js";
import { ApiContext, TBAAPI } from "../lib/tba_api/index.js";
import { analyticsPages } from "./analytics-tabs/index.js";
import "./styles.css";

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
    /** DON'T USE THIS ONE */
    None = "None",
    Home = "Home",
    Season = "Season Analysis",
    Event = "Event Analysis"
}

function TabSelect({ tab }: { tab: Tabs }) {
    return (
        <>
            <PersistPrefixKeyContext value={Tabs.Home}>
                <div hidden={tab != Tabs.Home} style={{ height: "100%" }}>
                    home page
                    {/* // TODO: make a home page */}
                </div>
            </PersistPrefixKeyContext>
            {analyticsPages.map((e, i) => (
                // pass tab key context to tab body
                <PersistPrefixKeyContext key={i} value={e.name}>
                    <e.TabSelect tab={tab} />
                </PersistPrefixKeyContext>
            ))}
        </>
    );
}

function Sidebar({ setActiveTab }: { setActiveTab: (value: Tabs) => void }) {
    return (
        <List>
            {/* // TODO: make a home page */}
            {/* <SidebarItem icon={<HomeIcon />} text={Tabs.Home} onClick={(e) => setActiveTab(e)} /> */}
            {analyticsPages.map((e, i) => (
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

const DBNAME = "FrcAnalysis";
const STORENAME = "AppState";
export const PersistPrefixKeyContext = createContext("");

function Home() {
    const [loaded, setLoaded] = useState(false);
    const [loadMessage, setLoadMessage] = useState("Waiting for TheBlueAlliance API");
    const [showSidebar, setShowSidebar] = useState(false);
    const [activeTab, setActiveTab] = useLSPersistentValue("activepage", Tabs.Event);

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
            setLoadMessage("TheBlueAlliance API Not accessible. Check internet connection");
        });
        return api;
    }, []);
    return (
        <>
            <div hidden style={{ display: "none" }}>
                {/* forces the zoom to be set on page load */}
                <ZoomControls />
            </div>
            <ThemeProvider theme={darkTheme}>
                <MuiXLicense />
                {/* provide api to all children */}
                <ApiContext value={api}>
                    <CssBaseline />
                    <Drawer
                        sx={{ zoom: "calc(1 / var(--zoom))" }}
                        open={loaded && showSidebar}
                        onClose={() => setShowSidebar(false)}
                    >
                        <Sidebar
                            {...{
                                setActiveTab: (tab: Tabs) => {
                                    setActiveTab(tab);
                                    setShowSidebar(false);
                                }
                            }}
                        />
                        <Divider />
                        <Box flexGrow={1} />
                        <Divider sx={{ margin: "5px 0px" }} />
                        <DBContextProvider dbName={DBNAME} storeName={STORENAME}>
                            <ClearData />
                        </DBContextProvider>
                        <Divider sx={{ margin: "5px 0px" }} />
                        <ZoomControls />
                        <Divider sx={{ marginTop: "10px" }} />
                        <Stack alignItems="center">
                            <Typography variant="h6" component="div" display={"inline-flex"} alignItems={"center"}>
                                Powered by:
                            </Typography>
                            <TBALogo />
                        </Stack>
                    </Drawer>
                    <Stack sx={{ height: "100%" }}>
                        <Box>
                            <AppBar position="static" sx={{ zoom: "calc(1 / var(--zoom))" }}>
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
                                    <Reload />
                                    {/* TODO: api key button? */}
                                    {/* <Button color="inherit">API Key</Button> */}
                                    <PWA />
                                </Toolbar>
                            </AppBar>
                        </Box>
                        {loaded ? (
                            // don't render site until api has loaded
                            // once loaded is true, it won't change to false, so no risk in recreating DB connections
                            <DBContextProvider dbName={DBNAME} storeName={STORENAME} wait={true}>
                                {/* don't render site until DB has loaded */}
                                <Box id="body" sx={{ flexGrow: 1, minHeight: "0" }}>
                                    <ErrorBoundary FallbackComponent={FallbackComponent()}>
                                        <TabSelect tab={activeTab} />
                                    </ErrorBoundary>
                                </Box>
                            </DBContextProvider>
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
