import { createAnalyticsPagePipeline } from "@/app/app_structure/createAnalyticsPagePipeline.js";
import { createPipeline, type Input } from "@/app/app_structure/pipeline/index.js";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Tabs } from "../page.js";

export default createAnalyticsPagePipeline(
    Tabs.Season,
    <CalendarMonthIcon />,
    createPipeline()
        .getInputs(
            [
                {
                    type: "number",
                    name: "Team Number",
                    min: 0
                },
                {
                    type: "number",
                    name: "Year",
                    min: 1992,
                    max: (api) => api.status!.max_season
                }
            ] as const satisfies Input[],
            "Get Season"
        )
        .then(([team, year]) => ({ team, year }))
        .api((api, data) => [api.getTeamDistricts("frc" + data.team), data.year] as const)
        .then(([districts, year]) => {
            if (!districts) return null;
            districts = districts.filter((e) => e.year == year);
            if (districts.length === 0) return null;
            return { district: districts[0], year };
        })
        .messageIfNone("No districts found for team/year", "info")
        // TODO: show district details
        // .show(function ({ data }) {
        //     return <div></div>;
        // })
        .api((api, data) => [data.year, api.getDistrictEvents(data.district.key)] as const)
        .then(([year, events]) => {
            if (!events) return null;
            if (events.length == 0) return null;
            return [year, events];
        })
        .messageIfNone("No events found in district (How????)", "info")
        .api(
            (api, [year, events]) =>
                [
                    year,
                    ...events.map((event) => api.getEventMatches(event.key).then((matches) => ({ event, matches })))
                ] as const
        ),
    function Body({ api, data: [year, ...events] }) {
        return (
            <div>
                <div>not implemented yet :(</div>
                <div>TBA status: {JSON.stringify(events)}</div>
            </div>
        );
    }
);
