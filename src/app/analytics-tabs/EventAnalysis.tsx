import { createAnalyticsPagePipeline } from "@/app/app_structure/createAnalyticsPagePipeline.js";
import { createPipeline, Input, SelectInput } from "@/app/app_structure/pipeline/index.js";
import EventDetails from "@/components/EventDetails.js";
import GraphTitle from "@/components/GraphTitle.js";
import { Event, Match } from "@/lib/tba_api/types.js";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { Box, Button, Grid, Paper, Stack } from "@mui/material";
import { BarChartPremium, LineChartPro } from "@mui/x-charts-premium";
import { DataGridPremium } from "@mui/x-data-grid-premium";
import { useState } from "react";
import { Tabs } from "../page.js";

function getTeamRP(teamKey: string, match: Match, year: number) {
    if (match.comp_level !== "qm") return 0;
    const { red, blue } = match.alliances;
    const redHas = red.team_keys.includes(teamKey);
    const blueHas = blue.team_keys.includes(teamKey);
    if (!(redHas || blueHas)) return 0;
    let alliance: "red" | "blue" = "blue";
    if (redHas) {
        alliance = "red";
    }
    // TODO: check year
    return (match.score_breakdown[alliance]?.rp as number) ?? 0;
}

function renderDiffCell(params: { row: { diff: number }; value?: any }) {
    const color = params.row.diff > 0 ? "lime" : params.row.diff == 0 ? "white" : "red";
    return <Box color={color}>{params.value}</Box>;
}

enum ShowGraph {
    All,
    Target,
    None
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
        .then(([eventId, { data, events }]) => ({
            data,
            event: events.find((e) => e.key === eventId)!
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
            const teamKeyToNumber: Record<string, number> = {};
            teams.forEach((t) => {
                teamKeyToNumber[t.key] = t.team_number;
            });
            const qualifiers = matches.filter((e) => e.comp_level === "qm");
            const roll: Record<string, number> = {};
            const teamRPs = teams.map((t) => {
                const rps = qualifiers.map((m) => {
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
            const matchRPs = qualifiers.map((e, idx) => {
                const entries = teamRPs.map((e) => [e.team + "", e.rps[idx].rp] as const);
                entries.push(["match_number", e.match_number]);
                return Object.fromEntries(entries);
            });
            const penalties: Record<string, { gained: number; lost: number; diff: number }> = {};
            matches.forEach((m) => {
                if (!m.score_breakdown || m.comp_level !== "qm") {
                    return;
                }
                const blueBad = m.score_breakdown.red.foulPoints;
                const redBad = m.score_breakdown.blue.foulPoints;
                const { red, blue } = m.alliances;
                const redAlliance = red.team_keys.filter((e) => !red.dq_team_keys.includes(e)).concat(red.surrogate_team_keys);
                const blueAlliance = blue.team_keys
                    .filter((e) => !blue.dq_team_keys.includes(e))
                    .concat(blue.surrogate_team_keys);
                redAlliance.forEach((t) => {
                    let data = penalties[teamKeyToNumber[t] + ""] ?? { gained: 0, lost: 0, diff: 0 };
                    data.gained += blueBad;
                    data.lost += redBad;
                    data.diff += blueBad - redBad;
                    penalties[teamKeyToNumber[t] + ""] = data;
                });
                blueAlliance.forEach((t) => {
                    let data = penalties[teamKeyToNumber[t] + ""] ?? { gained: 0, lost: 0, diff: 0 };
                    data.gained += redBad;
                    data.lost += blueBad;
                    data.diff += redBad - blueBad;
                    penalties[teamKeyToNumber[t] + ""] = data;
                });
            });
            const penaltiesFormatted = Object.entries(penalties).map((e, idx) => ({ ...e[1], teamNumber: e[0], id: idx }));
            // Array.from(matchNumbers).sort((a, b) => a - b)
            const teamMatches = matches
                .map((m) => {
                    if (m.comp_level !== "qm") return null;
                    const { red, blue } = m.alliances;
                    const redAlliance = red.team_keys
                        .filter((e) => !red.dq_team_keys.includes(e))
                        .concat(red.surrogate_team_keys);
                    const blueAlliance = blue.team_keys
                        .filter((e) => !blue.dq_team_keys.includes(e))
                        .concat(blue.surrogate_team_keys);
                    const isRed = redAlliance.includes("frc" + data.data.team);
                    const isBlue = blueAlliance.includes("frc" + data.data.team);
                    if (!isRed && !isBlue) return null;
                    let myPen = 0;
                    let theyPen = 0;
                    let score = 0;
                    if (isRed) {
                        myPen = m.score_breakdown?.blue?.foulPoints ?? 0;
                        theyPen = m.score_breakdown?.red?.foulPoints ?? 0;
                        score = red.score;
                    }
                    if (isBlue) {
                        myPen = m.score_breakdown?.red?.foulPoints ?? 0;
                        theyPen = m.score_breakdown?.blue?.foulPoints ?? 0;
                        score = blue.score;
                    }
                    const matchData = {
                        id: m.match_number + m.comp_level,
                        number: m.match_number,
                        penCommit: myPen,
                        oppPenCommit: theyPen,
                        diff: theyPen - myPen,
                        level: m.comp_level,
                        score
                    };
                    return matchData;
                })
                .filter((e) => e !== null);
            return [data, teams, matchRPs, roll, penaltiesFormatted, teamMatches] as const;
        }),
    function ({
        data: [
            {
                event,
                data: { team: targetTeam }
            },
            teams,
            matchRPs,
            roll,
            penalties,
            teamMatches
        ]
    }) {
        const [showGraph, setShowGraph] = useState<ShowGraph>(ShowGraph.All);
        const [key, setKey] = useState(0);
        const rollRows = Object.entries(roll).map((e) => ({ team: parseInt(e[0]), rp: e[1], id: e[0] }));
        return (
            <Box>
                <Stack spacing={2}>
                    <EventDetails event={event} />
                    {/* <Paper sx={{ padding: 3 }} elevation={6}> */}
                    <Grid container columns={{ xs: 4, sm: 8, md: 12 }} spacing={4}>
                        <Grid hidden={rollRows.length == 0} size={12}>
                            <Paper elevation={6}>
                                <GraphTitle text="Ranking Points by Match" />
                                <Button variant="outlined" onClick={() => setShowGraph(ShowGraph.All)}>
                                    All
                                </Button>
                                <Button variant="outlined" onClick={() => setShowGraph(ShowGraph.Target)}>
                                    Only {targetTeam}
                                </Button>
                                <Button variant="outlined" onClick={() => setShowGraph(ShowGraph.None)}>
                                    None
                                </Button>
                                <LineChartPro
                                    height={600}
                                    dataset={matchRPs}
                                    series={teams.map((e) => ({
                                        dataKey: e.team_number + "",
                                        label: e.team_number + "",
                                        showMark: e.team_number == targetTeam,
                                        id: e.team_number + ""
                                    }))}
                                    xAxis={[{ dataKey: "match_number" }]}
                                    yAxis={[{ width: 50 }]}
                                    hiddenItems={teams
                                        .filter(
                                            (e) =>
                                                showGraph == ShowGraph.None ||
                                                !(
                                                    (showGraph === ShowGraph.Target && e.team_number == targetTeam) ||
                                                    showGraph === ShowGraph.All
                                                )
                                        )
                                        .map((e) => ({
                                            seriesId: e.team_number + "",
                                            type: "line"
                                        }))}
                                    slotProps={{
                                        legend: {
                                            toggleVisibilityOnClick: true
                                        }
                                    }}
                                />
                            </Paper>
                        </Grid>
                        <Grid hidden={penalties.length == 0} size={12} sx={{ flexGrow: 1 }}>
                            <Paper elevation={6}>
                                <GraphTitle text="Penalty Points Differential" />
                                <BarChartPremium
                                    height={600}
                                    dataset={penalties
                                        .filter((e) => e.teamNumber !== "undefined")
                                        .sort((a, b) => a.diff - b.diff)}
                                    series={[
                                        {
                                            dataKey: "diff"
                                        }
                                    ]}
                                    xAxis={[{ dataKey: "teamNumber", tickLabelStyle: { angle: 75, fontSize: 12 }, height: 50 }]}
                                    yAxis={[
                                        {
                                            dataKey: "diff",
                                            colorMap: {
                                                type: "piecewise",
                                                thresholds: [0],
                                                colors: ["red", "green"]
                                            }
                                        }
                                    ]}
                                />
                            </Paper>
                        </Grid>
                        <Grid hidden={penalties.length == 0} size={{ xs: 4, sm: 8, md: 6 }} sx={{ flexGrow: 1 }}>
                            <Paper elevation={6}>
                                <GraphTitle text="Penalty Points Breakdown" />
                                <DataGridPremium
                                    rowHeight={25}
                                    columns={[
                                        {
                                            field: "teamNumber",
                                            headerName: "Team #",
                                            flex: 1,
                                            valueGetter(v, m) {
                                                const num = parseInt(m.teamNumber);
                                                if (isNaN(num)) return m.teamNumber;
                                                return num;
                                            }
                                        },
                                        { field: "gained", headerName: "Other team penalties", flex: 1 },
                                        {
                                            field: "diff",
                                            headerName: "Penalty differential",
                                            flex: 1,
                                            renderCell: renderDiffCell
                                        },
                                        { field: "lost", headerName: "Penalties commited", flex: 1 }
                                    ]}
                                    rows={penalties.filter((e) => e.teamNumber !== "undefined")}
                                    disableRowSelectionOnClick
                                    getRowClassName={(params) => {
                                        return parseInt(params.row.teamNumber) == targetTeam ? "target-team" : "";
                                    }}
                                />
                            </Paper>
                        </Grid>
                        <Grid hidden={rollRows.length == 0} size={{ xs: 4, sm: 8, md: 6 }} sx={{ flexGrow: 1 }}>
                            <Paper elevation={6}>
                                <GraphTitle text="Ranking Points" />
                                <DataGridPremium
                                    rowHeight={25}
                                    columns={[
                                        { field: "team", headerName: "Team #", flex: 1 },
                                        { field: "rp", headerName: "Total Ranking Points", flex: 1 }
                                    ]}
                                    rows={rollRows}
                                    disableRowSelectionOnClick
                                    getRowClassName={(params) => {
                                        return params.row.team == targetTeam ? "target-team" : "";
                                    }}
                                />
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 4, sm: 8, md: 12 }} sx={{ flexGrow: 1 }}>
                            <Paper elevation={6}>
                                <GraphTitle text={targetTeam + " Match Breakdown"} />
                                <DataGridPremium
                                    rowHeight={25}
                                    columns={[
                                        { field: "number", headerName: "Match #", flex: 1 },
                                        { field: "penCommit", headerName: "Penalties commited", flex: 1 },
                                        { field: "oppPenCommit", headerName: "Other team penalties", flex: 1 },
                                        {
                                            field: "diff",
                                            headerName: "Penalty differential",
                                            flex: 1,
                                            renderCell: renderDiffCell
                                        },
                                        { field: "score", headerName: "Total Score", flex: 1 }
                                    ]}
                                    rows={teamMatches}
                                    disableRowSelectionOnClick
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                    {/* </Paper> */}
                </Stack>
            </Box>
        );
    }
);
