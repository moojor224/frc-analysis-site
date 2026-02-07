import { createAnalyticsPagePipeline } from "@/app/app_structure/createAnalyticsPagePipeline.js";
import { createPipeline, Input } from "@/app/app_structure/pipeline/index.js";
import { Tabs } from "../page.js";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export default createAnalyticsPagePipeline(
    Tabs.Season,
    <CalendarMonthIcon />,
    createPipeline().then(() => []),
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
        return <div>not implemented yet :(</div>;
    }
);
