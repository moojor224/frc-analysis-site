import { createAnalyticsPagePipeline } from "@/app/app_structure/createAnalyticsPagePipeline";
import { createPipeline, type Input } from "@/app/app_structure/pipeline/index";
import GraphTitle from "@/components/GraphTitle";
import { Tabs } from "@/lib/lib";
import type { Match, Match_alliance, Team } from "@moojor224/tba-api";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Box, Paper } from "@mui/material";
import { DataGridPremium } from "@mui/x-data-grid-premium";

function getAllianceTeams(alliances: Match_alliance): string[] {
    const teams: string[] = [];
    alliances.team_keys;
    return [];
}

function getEventTeams(matches: Match[] | null): string[] {
    if (matches === null) return [];
    const teams: string[] = [];
    matches.forEach((m) => {
        teams.concat(m.alliances.red.team_keys.concat(m.alliances.blue.team_keys));
    });
    return [];
}

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
        .api((api, data) => [data.year, data.team, api.getTeamDistricts("frc" + data.team)] as const)
        .then(([year, team, districts]) => {
            if (!districts) return null;
            districts = districts.filter((e) => e.year == year);
            if (districts.length === 0) return null;
            return { district: districts[0], year, team };
        })
        .messageIfNone("No districts found for team/year", "info")
        // TODO: show district details
        // .show(function ({ data }) {
        //     return <div></div>;
        // })
        .api((api, data) => [data.year, data.team, api.getDistrictRankings(data.district.key)] as const)
        .then(([year, team, rankings]) => {
            if (rankings === null) return null;
            return { year, team, rankings };
        })
        .messageIfNone("No ranking info found for district", "info")
        .api(
            (api, data) => [data.year, data.team, data.rankings, ...data.rankings.map((e) => api.getTeam(e.team_key))] as const
        )
        .then(([year, team, rankings, ...teams]) => {
            return { year, team, rankings, teams: teams.filter((e) => e) as Team[] };
        }),
    function Body({ api, data }) {
        return (
            <div>
                not fully implemented yet...
                <Paper elevation={6}>
                    <GraphTitle text="District Points Ranking" />
                    <Box style={{ height: "1000px" }}>
                        <DataGridPremium
                            autoHeight={false}
                            rowHeight={25}
                            disableRowSelectionOnClick
                            columns={[
                                {
                                    field: "team_number",
                                    headerName: "Team #",
                                    flex: 1
                                },
                                {
                                    field: "point_total",
                                    headerName: "Points",
                                    flex: 1
                                },
                                {
                                    field: "rank",
                                    headerName: "Rank",
                                    flex: 1
                                }
                            ]}
                            rows={data.rankings.map((r) => ({
                                id: r.team_key,
                                team_number: data.teams.find((t) => t.key === r.team_key)?.team_number ?? 0,
                                point_total: r.point_total,
                                rank: r.rank
                            }))}
                            // sortModel={[{ field: "points_total", sort: "desc" }]}
                            initialState={{ sorting: { sortModel: [{ field: "rank", sort: "asc" }] } }}
                            getRowClassName={(params) => {
                                return params.row.team_number == data.team ? "target-team" : "";
                            }}
                        />
                    </Box>
                </Paper>
            </div>
        );
    }
);
