import { createAnalyticsPagePipeline } from "@/app/app_structure/createAnalyticsPagePipeline";
import { createPipeline, type Input, type SelectInput } from "@/app/app_structure/pipeline/index";
import MatchDisplay from "@/components/MatchDisplay";
import { Tabs } from "@/lib/lib";
import { useMountEffect } from "@moojor224/react-hooks";
import type { Event, Match } from "@moojor224/tba-api";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Box } from "@mui/material";
import { useContext, useState } from "react";
import { ApiContext } from "../page";

export default createAnalyticsPagePipeline(
    Tabs.EventMatches,
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
            if (!events) return null;
            return events.length === 0 ? null : { events, data: data.data };
        })
        .messageIfNone("No events found for given team and year", "info")
        .getInputs(
            (events) =>
                [
                    {
                        type: "select",
                        data: events.events,
                        key: "key",
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
        .api((api, data) => [data[0], data[1], api.getEventTeams(data[0])] as const)
        .then(([eventId, { data, events }, _teams]) => {
            const teams = new Map<string, number>();
            (_teams || []).forEach((t) => {
                teams.set(t.key, t.team_number);
            });
            return {
                data,
                event: events.find((e) => e.key === eventId)!,
                teams
            };
        }),
    function ({ data: { data, event, teams } }) {
        const team = data.team;
        const api = useContext(ApiContext);
        const [matches, setMatches] = useState<Match[]>([]);
        useMountEffect(() => {
            function run() {
                api.getEventMatches(event.key).then((m) => {
                    if (m) {
                        setMatches(m);
                    }
                });
            }
            const interval = setInterval(run, 25 * 1000);
            run();
            return () => {
                clearInterval(interval);
            };
        });
        return (
            <Box>
                <MatchDisplay matches={matches} teams={teams} />
            </Box>
        );
    }
);
