import { StoreContext } from "@/components/IndexedDB.js";
import { usePersistentValue } from "@/lib/usePersistentValue.js";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import { Container, Paper, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import type { TabScrollButtonProps } from "@mui/material/TabScrollButton";
import MaterialTabs from "@mui/material/Tabs";
import React, { useContext, useState } from "react";
import { ApiContext, TBAAPI } from "../../lib/tba_api/index.js";
import { PersistPrefixKeyContext, Tabs } from "../page.js";
import { useInstanceManager } from "./analytics_page/useInstanceManager.js";

type PickerComponent<T> = React.FunctionComponent<{
    api: TBAAPI;
    setData: (data: T) => void;
    /** tab number. use this to prefix keys used to cache data in localStorage */
    tabId: string;
}>;
type BodyComponent<T> = React.FunctionComponent<{
    api: TBAAPI;
    data: T;
    tabId: string;
}>;
function B({ ico, oc }: { oc: React.MouseEventHandler; ico: React.ReactNode }) {
    return (
        <Button onClick={oc} variant="outlined">
            {ico}
        </Button>
    );
}

export function createAnalyticsPage<T>(
    name: Tabs,
    icon: React.ReactNode,
    PickerComponent: PickerComponent<T>,
    BodyComponent: BodyComponent<T>
) {
    function Instance() {
        const analyticsPagePrefix = useContext(PersistPrefixKeyContext);
        const api = useContext(ApiContext);
        const [data, setData] = useState<T | null>(null);
        // console.log({ data });
        return (
            <Container maxWidth="xl" sx={{ padding: 3 }}>
                <Stack spacing={2}>
                    <Paper elevation={4} sx={{ padding: 3 }}>
                        <PickerComponent {...{ api, setData }} tabId={`${name}-${0}`} />
                    </Paper>
                    {data === null ? (
                        <></>
                    ) : (
                        <Paper elevation={4} sx={{ padding: 3, wordWrap: "break-word" }}>
                            <BodyComponent {...{ api, data }} tabId={`${name}-${0}`} />
                        </Paper>
                    )}
                </Stack>
            </Container>
        );
    }
    function Component() {
        const store = useContext(StoreContext);
        const analyticsPageId = useContext(PersistPrefixKeyContext);
        const [tabNums, setTabNums] = usePersistentValue<(number | void)[]>(`${analyticsPageId}-tabnumsarr`, []);
        const manager = useInstanceManager<{ title: string }>(
            Instance,
            (id) => ({
                title: "Tab " + (id + 1)
            }),
            tabNums
        );
        if (manager.instances.length < 1) {
            addInstance();
        }
        const [activeTab, setActiveTab] = usePersistentValue<number>(`${analyticsPageId}-activetab`, 0);
        function closeTab() {
            // console.info("closing tab", activeTab);
            manager.removeInstance(activeTab);
            setActiveTab(manager.instances.indexOf(manager.instances.find((e) => e)));
            delete tabNums[activeTab];
            setTabNums(Array.from(tabNums));
            // TODO: clean out old keys
            const prefix = analyticsPageId + "-" + activeTab;
            // const keys = new Array(localStorage.length)
            //     .fill(0)
            //     .map((e, i) => localStorage.key(i))
            //     .filter((e) => e !== null && e.startsWith(prefix)) as string[];
            // console.log(keys);
            store.clear(prefix);
        }
        function addInstance() {
            const id = manager.id;
            manager.addInstance({ title: "Tab " + (id + 1) });
            const newTabs = tabNums.concat(id);
            // console.log("add instance", manager.instances, newTabs);
            setTabNums(newTabs);
        }
        if (activeTab === -1) {
            setActiveTab(manager.instances.indexOf(manager.instances.find((e) => e)));
        }
        return (
            <Stack sx={{ height: "100%" }}>
                <Box sx={{ bgcolor: "background.paper" }}>
                    <MaterialTabs
                        value={activeTab}
                        onChange={(_, newTab) => setActiveTab(newTab)}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile={true}
                        slots={{
                            scrollButtons: function (props: TabScrollButtonProps) {
                                const isLeft = props.direction === "left";
                                const isRow = props.orientation === "horizontal";
                                const leftScroll = isRow ? <KeyboardArrowLeft /> : <KeyboardArrowUp />;
                                const rightScroll = isRow ? <KeyboardArrowRight /> : <KeyboardArrowDown />;
                                return (
                                    <Button
                                        className={props.className}
                                        disabled={props.disabled}
                                        onClick={props.onClick}
                                        ref={props.ref}
                                        sx={{ padding: 1, minWidth: "26px" }}
                                    >
                                        {isLeft ? (
                                            props.slots?.StartScrollButtonIcon ? (
                                                <props.slots.StartScrollButtonIcon />
                                            ) : (
                                                leftScroll
                                            )
                                        ) : props.slots?.EndScrollButtonIcon ? (
                                            <props.slots.EndScrollButtonIcon />
                                        ) : (
                                            rightScroll
                                        )}
                                    </Button>
                                );
                            }
                        }}
                    >
                        {manager.instances.map((e, i) =>
                            e ? (
                                <Tab
                                    onMouseDown={(evt) => {
                                        if (evt.button === 0) setActiveTab(i);
                                        if (evt.button === 1) closeTab();
                                    }}
                                    key={i}
                                    value={i}
                                    label={e.element.props.title}
                                />
                            ) : null
                        )}
                    </MaterialTabs>
                    <Box display="flex" flexWrap="nowrap" overflow="auto" className="hide-scrollbar">
                        <B ico={<AddIcon />} oc={() => addInstance()} />
                        <B ico={<CloseIcon />} oc={() => closeTab()} />
                    </Box>
                </Box>
                <Box className="hide-scrollbar" sx={{ position: "relative", overflowY: "auto" }}>
                    {manager.instances.map((e, i) =>
                        e ? (
                            // pass tab num through context
                            <PersistPrefixKeyContext value={analyticsPageId + "-" + i}>
                                <div
                                    style={{
                                        transform: i != activeTab ? "translateX(-200vw)" : "translateX(0)",
                                        position: i != activeTab ? "absolute" : "unset",
                                        top: "0"
                                    }}
                                >
                                    {e.element}
                                </div>
                            </PersistPrefixKeyContext>
                        ) : null
                    )}
                </Box>
            </Stack>
        );
    }
    function TabSelect({ tab }: { tab: string }) {
        return (
            <div hidden={tab != name} style={{ height: "100%" }}>
                <Component />
            </div>
        );
    }
    return {
        name,
        icon,
        TabSelect,
        Component
    };
}
