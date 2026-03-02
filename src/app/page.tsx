import ClearData from "@/components/ClearData";
import FallbackComponent from "@/components/FallbackComponent";
import MuiXLicense from "@/components/MuiXLicense";
import PWA from "@/components/PWA";
import Reload from "@/components/Reload";
import ZoomControls from "@/components/ZoomControls";
import { DBContextProvider } from "@/lib/useDBPersistentValue";
import { useLSPersistentValue } from "@/lib/useLSPersistentValue";
import { persistValue } from "@moojor224/persistent-value";
import type { API_Status, SearchIndex } from "@moojor224/tba-api";
import { setRateLimit, TBAAPI } from "@moojor224/tba-api";
import GitHubIcon from "@mui/icons-material/GitHub";
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
import { TBALogo } from "../components/tba_lamp";
import { Tabs, type TabKeys } from "../lib/lib";
import { analyticsPages } from "./analytics-tabs/index";
import "./styles.css";
import { version } from "./version";

const fakeAPI = new Proxy<TBAAPI>({} as any, {
    get(_t, key: string) {
        if (key === "API_KEY") return "";
        if (key === "status")
            return {
                android: {
                    latest_app_version: 0,
                    min_app_version: 0
                },
                current_season: 0,
                down_events: [],
                ios: {
                    latest_app_version: 0,
                    min_app_version: 0
                },
                is_datafeed_down: true,
                max_season: 0,
                max_team_page: 0
            } satisfies API_Status;
        if (key === "searchIndex")
            return {
                teams: [],
                events: []
            } satisfies SearchIndex;
        return async function () {
            return null;
        };
    }
});
export const ApiContext = createContext(fakeAPI);

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

function TabSelect({ tab }: { tab: TabKeys }) {
    return (
        <>
            {/* <PersistPrefixKeyContext value={Tabs.Home}>
                <div hidden={tab != Tabs.Home} style={{ height: "100%" }}>
                    home page
                </div>
            </PersistPrefixKeyContext> */}
            {analyticsPages.map((e, i) => (
                // pass tab key context to tab body
                <PersistPrefixKeyContext key={i} value={e.name}>
                    <e.TabSelect tab={tab} />
                </PersistPrefixKeyContext>
            ))}
        </>
    );
}

function Sidebar({ setActiveTab }: { setActiveTab: (value: TabKeys) => void }) {
    return (
        <List>
            {/* // TODO: make a home page */}
            {/* <SidebarItem icon={<HomeIcon />} text={Tabs.Home} onClick={(e) => setActiveTab(e)} /> */}
            {analyticsPages.map((e, i) => (
                <SidebarItem key={i} icon={e.icon} text={e.name} onClick={(e) => setActiveTab(e)} />
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

const DBNAME = "FrcAnalysis";
const STORENAME = "AppState";
export const PersistPrefixKeyContext = createContext("");

function App() {
    const [loaded, setLoaded] = useState(false);
    const [loadMessage, setLoadMessage] = useState("Waiting for TheBlueAlliance API");
    const [showSidebar, setShowSidebar] = useState(false);
    const [activeTab, setActiveTab] = useLSPersistentValue<TabKeys>("frc-analysis-activepage", Tabs.Event);

    const api = useMemo(() => {
        const api = new TBAAPI(API_KEY);
        setRateLimit(10);
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
                <CssBaseline />
                {/* provide api to all children */}
                <ApiContext value={api}>
                    <Drawer
                        sx={{ zoom: "calc(1 / var(--zoom))" }}
                        open={loaded && showSidebar}
                        onClose={() => setShowSidebar(false)}
                    >
                        <Sidebar
                            {...{
                                setActiveTab: (tab: TabKeys) => {
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
                        <Divider sx={{ margin: "5px 0px" }} />
                        <Box display="flex" alignItems="center" justifyContent="center" marginBottom="5px">
                            <IconButton href="https://github.com/moojor224/frc-analysis-site" target="_blank" rel="noreferrer">
                                <GitHubIcon fontSize="inherit" />
                            </IconButton>
                        </Box>
                        <Divider />
                        <Box>
                            <Typography fontSize="10px" fontFamily="monospace    ">
                                {version}
                            </Typography>
                        </Box>
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

ReactDOM.createRoot(document.querySelector("#root")!).render(React.createElement(App));
