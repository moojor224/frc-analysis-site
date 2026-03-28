import type { Match } from "@moojor224/tba-api";

export default function MatchDisplay({ matches, teams }: { matches: Match[]; teams: Map<string, number> }) {
    return (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    <th style={{ textAlign: "center", borderBottom: "1px solid #ccc", padding: 8 }}>Match Number</th>
                    <th style={{ textAlign: "center", borderBottom: "1px solid #ccc", padding: 8 }}>Red</th>
                    <th style={{ textAlign: "center", borderBottom: "1px solid #ccc", padding: 8 }}>Red Score</th>
                    <th style={{ textAlign: "center", borderBottom: "1px solid #ccc", padding: 8 }}>Winner</th>
                    <th style={{ textAlign: "center", borderBottom: "1px solid #ccc", padding: 8 }}>Blue Score</th>
                    <th style={{ textAlign: "center", borderBottom: "1px solid #ccc", padding: 8 }}>Blue</th>
                </tr>
            </thead>
            <tbody>
                {matches.map((m) => {
                    const redTeams = m.alliances.red.team_keys.map((e) => (teams.has(e) ? teams.get(e) : e)).join(", ") || "—";
                    const blueTeams =
                        m.alliances.blue.team_keys.map((e) => (teams.has(e) ? teams.get(e) : e)).join(", ") || "—";
                    const redScore = m.alliances.red.score ?? 0;
                    const blueScore = m.alliances.blue.score ?? 0;
                    if (redScore === -1) return null;

                    let winnerLabel = "TBD";
                    if (m.winning_alliance === "red") winnerLabel = "Red";
                    else if (m.winning_alliance === "blue") winnerLabel = "Blue";
                    else if (typeof redScore === "number" && typeof blueScore === "number") {
                        if (redScore === blueScore) winnerLabel = "Tie";
                        else winnerLabel = redScore > blueScore ? "Red" : "Blue";
                    }

                    return (
                        <tr key={m.key}>
                            <td
                                style={{
                                    padding: 8,
                                    textAlign: "center",
                                    borderBottom: "1px solid #eee",
                                    verticalAlign: "top"
                                }}
                            >
                                {m.comp_level.toUpperCase()} {m.set_number}-{m.match_number}
                            </td>

                            {/* Red teams */}
                            <td
                                style={{
                                    padding: 8,
                                    textAlign: "center",
                                    borderBottom: "1px solid #eee",
                                    verticalAlign: "top"
                                }}
                            >
                                <div>{redTeams}</div>
                            </td>

                            {/* Red score */}
                            <td
                                style={{
                                    padding: 8,
                                    borderBottom: "1px solid #eee",
                                    verticalAlign: "top",
                                    textAlign: "center"
                                }}
                            >
                                <strong>{redScore}</strong>
                            </td>

                            {/* Winner */}
                            <td
                                style={{
                                    padding: 8,
                                    textAlign: "center",
                                    borderBottom: "1px solid #eee",
                                    verticalAlign: "top"
                                }}
                            >
                                {winnerLabel}
                            </td>

                            {/* Blue score */}
                            <td
                                style={{
                                    padding: 8,
                                    borderBottom: "1px solid #eee",
                                    verticalAlign: "top",
                                    textAlign: "center"
                                }}
                            >
                                <strong>{blueScore}</strong>
                            </td>
                            {/* Blue teams */}
                            <td
                                style={{
                                    padding: 8,
                                    textAlign: "center",
                                    borderBottom: "1px solid #eee",
                                    verticalAlign: "top"
                                }}
                            >
                                <div>{blueTeams}</div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}
