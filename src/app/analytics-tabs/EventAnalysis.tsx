import { createAnalyticsPagePipeline } from "@/app/app_structure/createAnalyticsPagePipeline.js";
import { createPipeline, Input, SelectInput } from "@/app/app_structure/pipeline/index.js";
import EventDetails from "@/components/EventDetails.js";
import { Event, Match } from "@/lib/tba_api/types.js";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Box } from "@mui/material";
import { LineChart, LineChartPro, LineSeries } from "@mui/x-charts-premium";
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
        .then(([data, matches, teams]) => {
            if (teams === null || teams.length === 0) return null;
            return [
                data,
                matches.sort((a, b) => a.match_number - b.match_number),
                teams!.sort((a, b) => a.team_number - b.team_number)
            ];
        })
        .messageIfNone("No teams found for selected event. (How???). The api might have just gone down", "error")
        .then(([data, matches, teams]) => {
            const matchNumbers = new Set<number>();
            const qm = matches.filter((e) => e.comp_level === "qm");
            const roll: Record<string, number> = {};
            const teamRPs = teams.map((t) => {
                const rps = qm.map((m) => {
                    matchNumbers.add(m.match_number);
                    const rp = getTeamRP(t.key, m, data.data.year);
                    const rol = (roll[t.team_number + ""] ?? 0) + rp;
                    roll[t.team_number + ""] = rol;
                    // if (t.team_number == 118) {
                    //     console.log(rol);
                    // }
                    return {
                        match_number: m.match_number,
                        rp: rol
                    };
                });
                return {
                    team: t.team_number,
                    rps,
                    totalRP: rps.reduce((a, b) => a + b.rp, 0)
                };
            });
            const matchRPs = qm.map((e, idx) => {
                const entries = teamRPs.map((e) => [e.team + "", e.rps[idx].rp] as const);
                entries.push(["match_number", e.match_number]);
                return Object.fromEntries(entries);
            });
            // Array.from(matchNumbers).sort((a, b) => a - b)
            return [data, teams, matchRPs] as const;
        }),
    function ({
        data: [
            {
                event,
                data: { team: targetTeam }
            },
            teams,
            matchRPs
        ]
    }) {
        return (
            <Box>
                <EventDetails event={event} />
                {/* {JSON.stringify(teamRPs)} */}
                <LineChartPro
                    height={800}
                    dataset={matchRPs}
                    series={teams.map((e) => ({
                        dataKey: e.team_number + "",
                        label: e.team_number + "",
                        showMark: e.team_number == targetTeam
                    }))}
                    xAxis={[{ dataKey: "match_number" }]}
                    yAxis={[{ width: 50 }]}
                />
            </Box>
        );
    }
);
