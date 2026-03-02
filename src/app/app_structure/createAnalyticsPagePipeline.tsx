import type { TabKeys } from "@/lib/lib";
import { TBAAPI } from "@moojor224/tba-api";
import React from "react";
import { createAnalyticsPage } from "./createAnalyticsPage";
import { type Pipeline } from "./pipeline/index";
import { PipelineRenderer } from "./pipeline/PipelineRenderer";

/**
 * simple createAnalyticsPage wrapper to make the inputs section pipeline-generated
 */
export function createAnalyticsPagePipeline<T>(
    name: TabKeys,
    icon: React.ReactNode,
    pipeline: Pipeline<T>,
    BodyComponent: React.FunctionComponent<{
        api: TBAAPI;
        data: T;
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
