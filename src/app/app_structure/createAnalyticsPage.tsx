import { PersistPrefixKeyContext, Tabs } from "@/app/page.js";
import FallbackComponent from "@/components/FallbackComponent.js";
import { ApiContext, TBAAPI } from "@/lib/tba_api/index.js";
import { DBContext, useDBPersistentValue } from "@/lib/useDBPersistentValue.js";
import { localstorageAdapter, useLSPersistentValue } from "@/lib/useLSPersistentValue.js";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
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
import React, { useContext } from "react";
import { ErrorBoundary } from "react-error-boundary";
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
        const [data, setData] = useDBPersistentValue<T | null>(`${analyticsPagePrefix}-data`, null);
        // console.log({ data });
        return (
            <Container maxWidth="xl" sx={{ padding: 3 }}>
                <Stack spacing={2}>
                    <ErrorBoundary resetKeys={[data]} FallbackComponent={FallbackComponent("Error during data selection. Close and open this tab to continue")}>
                        <Paper elevation={4} sx={{ padding: 3 }}>
                            <PickerComponent {...{ api, setData }} tabId={`${name}-${0}`} />
                        </Paper>
                    </ErrorBoundary>
                    {data === null ? (
                        <></>
                    ) : (
                        <ErrorBoundary FallbackComponent={FallbackComponent("Error during data parsing. Check data input to ensure validity")}>
                            <Paper elevation={4} sx={{ padding: 3, wordWrap: "break-word" }}>
                                <BodyComponent {...{ api, data }} tabId={`${name}-${0}`} />
                            </Paper>
                        </ErrorBoundary>
                    )}
                </Stack>
            </Container>
        );
    }
    function Component() {
        const IDB = useContext(DBContext);
        const analyticsPageId = useContext(PersistPrefixKeyContext);
        const [activeTab, setActiveTab] = useLSPersistentValue(`${analyticsPageId}-activetab`, 0);
        const [tabNums, setTabNums] = useLSPersistentValue<number[]>(`${analyticsPageId}-tabnumsarr`, []);
        const [tabNameMap, setTabNameMap] = useLSPersistentValue<Record<string | number, string>>(
            `${analyticsPageId}-tabnamemap`,
            {}
        );
        const manager = useInstanceManager<{}>(Instance, () => ({}), tabNums);
        if (manager.instances.length < 1) {
            addInstance();
        }
        function closeTab() {
            console.info("closing tab", activeTab);
            const instance = manager.instances[activeTab];
            if (!instance) return;
            delete tabNameMap[instance.id];
            setTabNameMap({ ...tabNameMap });
            manager.removeInstance(activeTab);
            setActiveTab(manager.instances.indexOf(manager.instances.find((e) => e)));
            delete tabNums[activeTab];
            setTabNums(Array.from(tabNums.filter((e) => typeof e == "number")));
            const prefix = analyticsPageId + "-" + activeTab;
            IDB.clear(prefix);
            localstorageAdapter.clear(prefix);
        }
        const selectedInstance = manager.instances[activeTab];
        if (!selectedInstance && manager.instances.length > 0) {
            const instance = manager.instances.find((e) => e);
            if (instance) {
                setActiveTab(manager.instances.indexOf(instance));
            }
        }
        function addInstance() {
            const id = manager.addInstance({}).id;
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
                                    label={tabNameMap[e.element.props.id]?.trim() || `Tab ${e.element.props.id + 1}`}
                                />
                            ) : null
                        )}
                    </MaterialTabs>
                    <Box display="flex" flexWrap="nowrap" overflow="auto" className="hide-scrollbar">
                        <B ico={<AddIcon />} oc={() => addInstance()} />
                        <B ico={<CloseIcon />} oc={() => closeTab()} />
                        <B
                            ico={<EditIcon />}
                            oc={() => {
                                const title = prompt("Change tab title");
                                if (!title) {
                                    return;
                                }
                                tabNameMap[manager.instances[activeTab]!.id] = title;
                                setTabNameMap({ ...tabNameMap });
                            }}
                        />
                    </Box>
                </Box>
                <Box className="hide-scrollbar" sx={{ position: "relative", overflowY: "auto" }}>
                    {manager.instances.map((e, i) =>
                        e ? (
                            <PersistPrefixKeyContext key={i} value={analyticsPageId + "-" + i}>
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
