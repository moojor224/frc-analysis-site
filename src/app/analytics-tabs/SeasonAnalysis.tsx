import { createAnalyticsPagePipeline } from "@/app/app_structure/createAnalyticsPagePipeline.js";
import { createPipeline } from "@/app/app_structure/pipeline/index.js";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Tabs } from "../page.js";

export default createAnalyticsPagePipeline(
    Tabs.Season,
    <CalendarMonthIcon />,
    createPipeline()
        .api((api) => [api.getStatus()] as const)
        .then((e) => e[0])
        .messageIfNone("Unable to reach TBA APi", "error"),
    // .getInputs(
    //     [
    //         {
    //             type: "number",
    //             name: "Team Number",
    //             min: 0
    //         },
    //         {
    //             type: "number",
    //             name: "Year",
    //             min: 1992,
    //             max: (api) => api.status!.max_season
    //         }
    //     ] satisfies Input[],
    //     "Get Season"
    // )
    // .then(([team, year]) => ({ team, year }))
    function Body({ api, data }) {
        return (
            <div>
                <div>not implemented yet :(</div>
                <div>TBA status: {JSON.stringify(data)}</div>
            </div>
        );
    }
);
