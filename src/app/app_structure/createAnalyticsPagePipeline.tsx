import { TBAAPI } from "@moojor224/tba-api";
import React from "react";
import { Tabs } from "../page.js";
import { createAnalyticsPage } from "./createAnalyticsPage.js";
import { Pipeline } from "./pipeline/index.js";
import { PipelineRenderer } from "./pipeline/PipelineRenderer.js";

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
