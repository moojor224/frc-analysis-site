import { Container, Paper, Stack } from "@mui/material";
import { useContext, useState } from "react";
import { Tabs } from "../page.js";
import { ApiContext, TBAAPI } from "../../lib/tba_api/index.js";
import { useInstanceManager } from "./analytics_page/useInstanceManager.js";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import type { TabScrollButtonProps } from "@mui/material/TabScrollButton";
import MaterialTabs from "@mui/material/Tabs";
import React from "react";
import { Pipeline, Step } from "./pipeline/index.js";
import { PipelineRenderer } from "./pipeline/PipelineRenderer.js";
import { createAnalyticsPage } from "./createAnalyticsPage.js";

/**
 * simple createAnalyticsPage wrapper to make the inputs section pipeline-generated
 */
export function createAnalyticsPagePipeline<T>(
    name: Tabs,
    icon: React.ReactNode,
    pipeline: Pipeline<T>,
    BodyComponent: React.FunctionComponent<{
        api: TBAAPI;
        data: T;
        tabId: string;
    }>
) {
    return createAnalyticsPage(
        name,
        icon,
        function ({ setData }) {
            return <PipelineRenderer setOutput={setData} pipeline={pipeline} />;
        },
        BodyComponent
    );
}
