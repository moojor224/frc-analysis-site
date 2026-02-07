import { createAnalyticsPagePipeline } from "@/app/app_structure/createAnalyticsPagePipeline.js";
import { createPipeline, Input, SelectInput } from "@/app/app_structure/pipeline/index.js";
import EventDetails from "@/components/EventDetails.js";
import { Event, Match } from "@/lib/tba_api/types.js";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Box } from "@mui/material";
import { Tabs } from "../page.js";

function getTeamRP(teamKey: string, match: Match, year: number) {
    const { red, blue } = match.alliances;
    const redHas = red.team_keys.includes(teamKey);
    let alliance: "red" | "blue" = "blue";
    if (redHas) {
        alliance = "red";
    }
    // TODO: check year
    return (match.score_breakdown[alliance]?.rp as number) ?? 0;
}

export default createAnalyticsPagePipeline(
    Tabs.Event,
    <EmojiEventsIcon />,
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
            ] satisfies Input[],
            "Get Events"
        )
        .then(([team, year]) => ({ team, year }))
        .api(
            (api, data) =>
                [
                    api.getTeamEventsByYear("frc" + data.team, data.year + "").then((e) => ({
                        events: e,
                        data
                    }))
                ] as const
        )
        .then(([data]) => {
            const events = data.events;
            console.log(events);
            if (!events) return events;
            return events.length === 0 ? null : { events, data: data.data };
        })
        .messageIfNone("No events found for given team and year", "info")
        .getInputs(
            (events) =>
                [
                    {
                        type: "select",
                        data: events.events,
                        key: "event_code",
                        name: "Event",
                        label: "name"
                    } satisfies SelectInput<Event>,
                    {
                        type: "raw",
                        data: events
                    }
                ] as const,
            "Analyze Event",
            true
        )
        .then(([eventId, { data, events }]) => ({
            data,
            event: events!.find((e) => e.event_code === eventId)!
        }))
        .api((api, { data, event }) => [{ data, event }, api.getEventMatches(event.key), api.getEventTeams(event.key)] as const)
        .then(([data, matches, oopsAllTeams]) => {
            if (matches === null || matches.length === 0) return null;
            return [data, matches!, oopsAllTeams];
        })
        .messageIfNone("No matches found for selected event", "info")
        .then(([data, matches, oopsAllTeams]) => {
            if (oopsAllTeams === null || oopsAllTeams.length === 0) return null;
            return [
                data,
                matches.sort((a, b) => a.match_number - b.match_number),
                oopsAllTeams!.sort((a, b) => a.team_number - b.team_number)
            ];
        })
        .messageIfNone("No teams found for selected event. (How???). The api might have just gone down", "error")
        .then(([data, matches, teams]) => {
            const qm = matches.filter((e) => e.comp_level === "qm");
            const teamRPs = teams.map((t) => {
                const rps = qm.map((m) => ({
                    match_number: m.match_number,
                    rp: getTeamRP(t.key, m, data.data.year)
                }));
                return {
                    team: t.team_number,
                    rps,
                    totalRP: rps.reduce((a, b) => a + b.rp, 0)
                };
            });
            return [data, teamRPs] as const;
        }),
    function ({ data: [{ event }, teamRPs] }) {
        return (
            <Box>
                <EventDetails event={event} />
                {JSON.stringify(teamRPs)}
            </Box>
        );
    }
);
