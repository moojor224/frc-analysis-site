export type API_Status = {
    current_season: number;
    max_season: number;
    is_datafeed_down: boolean;
    down_events: string[];
    ios: API_Status_App_Version;
    android: API_Status_App_Version;
    max_team_page: number;
};
export type API_Status_App_Version = {
    min_app_version: number;
    latest_app_version: number;
};
export type AutoChargeStationRobot_2023 = "Docked" | "None";
export type AutoLineRobot_2024 = "No" | "Yes";
export type AutoRobot_2018 = "None" | "AutoRun";
export type Award = {
    name: string;
    award_type: number;
    event_key: string;
    recipient_list: Award_Recipient[];
    year: number;
};
export type Award_Recipient = {
    team_key: string | null;
    awardee: string | null;
};
export type Bay_2019 = "None" | "Panel" | "PanelAndCargo";
export type BridgeState_2023 = "Level" | "NotLevel";
export type CompLevel = "qm" | "ef" | "qf" | "sf" | "f";
export type District = {
    abbreviation: string;
    display_name: string;
    key: string;
    year: number;
};
export type DistrictInsightRegionData = {
    yearly_active_team_count: Record<number, number>;
    yearly_event_count: Record<number, number>;
    yearly_gained_teams: Record<number, number>;
    yearly_lost_teams: Record<number, number>;
};
export type District_Advancement = {
    dcmp: boolean;
    cmp: boolean;
};
export type District_Insight = {
    district_data: {
        region_data: DistrictInsightRegionData | null;
        district_wide_data: DistrictInsightRegionData | null;
    };
    team_data: {
        district_seasons: number;
        total_district_points: number;
        total_pre_dcmp_district_points: number;
        district_event_wins: number;
        dcmp_wins: number;
        team_awards: number;
        individual_awards: number;
        quals_record: WLT_Record;
        elims_record: WLT_Record;
        in_district_extra_play_count: number;
        total_matches_played: number;
        dcmp_appearances: number;
        cmp_appearances: number;
    } | null;
};
export type District_Ranking = {
    team_key: string;
    rank: number;
    rookie_bonus: number;
    point_total: number;
    event_points: {
        district_cmp: boolean;
        total: number;
        alliance_points: number;
        elim_points: number;
        award_points: number;
        event_key: string;
        qual_points: number;
    }[];
    adjustments: number;
    other_bonus: number;
};
export type Double_Elim_Round =
    | "Finals"
    | "Round 1"
    | "Round 2"
    | "Round 3"
    | "Round 4"
    | "Round 5";
export type Elimination_Alliance = {
    name: string;
    backup: {
        in: string;
        out: string;
    } | null;
    declines: string[];
    picks: string[];
    status: {
        playoff_average: number | null;
        playoff_type: number | null;
        level: string;
        record: WLT_Record | null;
        current_level_record: WLT_Record | null;
        status: string;
        advanced_to_round_robin_finals: boolean;
        double_elim_round: string;
        round_robin_rank: number;
    };
};
export type EndGameChargeStationRobot_2023 = "Docked" | "None" | "Park" | "Parked";
export type EndGameRobot_2024 = "CenterStage" | "None" | "Parked" | "StageLeft" | "StageRight";
export type EndGameRobot_2025 = "DeepCage" | "None" | "Parked" | "ShallowCage";
export type TowerRobot_2026 = "Level1" | "Level2" | "Level3" | "None";
export type HubScore_2026 = {
    autoCount: number;
    autoPoints: number;
    endgameCount: number;
    endgamePoints: number;
    shift1Count: number;
    shift1Points: number;
    shift2Count: number;
    shift2Points: number;
    shift3Count: number;
    shift3Points: number;
    shift4Count: number;
    shift4Points: number;
    teleopCount: number;
    teleopPoints: number;
    totalCount: number;
    totalPoints: number;
    transitionCount: number;
    transitionPoints: number;
};
export type EndgameRobot_2018 = "Climbing" | "Levitate" | "None" | "Parking" | "Unknown";
export type EndgameRobot_2019 = "HabLevel1" | "HabLevel2" | "HabLevel3" | "None" | "Unknown";
export type EndgameRobot_2020 = "Hang" | "None" | "Park";
export type EndgameRobot_2022 = "High" | "Low" | "Mid" | "None" | "Traversal";
export type EndgameRungIsLevel_2020 = "IsLevel" | "NotLevel";
export type Event = {
    key: string;
    name: string;
    event_code: string;
    event_type: number;
    district: District | null;
    city: string | null;
    state_prov: string | null;
    country: string | null;
    start_date: string;
    end_date: string;
    year: number;
    short_name: string | null;
    event_type_string: string;
    week: number | null;
    address: string | null;
    postal_code: string | null;
    gmaps_place_id: string | null;
    gmaps_url: string | null;
    lat: number | null;
    lng: number | null;
    location_name: string | null;
    timezone: string | null;
    website: string | null;
    first_event_id: string | null;
    first_event_code: string | null;
    webcasts: Webcast[];
    division_keys: string[];
    parent_event_key: string | null;
    playoff_type: number | null;
    playoff_type_string: string | null;
    remap_teams: Record<string, string> | null;
};
export type Event_COPRs = Record<string, number>;
export type Event_District_Points = {
    points: Record<
        string,
        {
            total: number;
            alliance_points: number;
            elim_points: number;
            award_points: number;
            qual_points: number;
        }
    >;
    tiebreakers: Record<
        string,
        {
            highest_qual_scores: number[];
            qual_wins: number;
        }
    >;
};
export type Event_Insights = {
    qual: any;
    playoff: any;
};
// TODO: Event_Insights_2016
// TODO: Event_Insights_2017
// TODO: Event_Insights_2018
export type Event_OPRS = {
    oprs: Record<string, number>;
    dprs: Record<string, number>;
    ccwms: Record<string, number>;
};
export type Event_Predictions = unknown;
export type Event_Ranking = {
    rankings: {
        matches_played: number;
        qual_average: number | null;
        extra_stats: number[];
        sort_orders: number[];
        record: WLT_Record | null;
        rank: number;
        dq: number;
        team_key: string;
    }[];
    extra_stats_info: {
        precision: number;
        name: string;
    }[];
    sort_order_info:
        | {
              precision: number;
              name: string;
          }[]
        | null;
};
export type Event_Simple = {
    key: string;
    name: string;
    event_code: string;
    event_type: number;
    district: District | null;
    city: string | null;
    state_prov: string | null;
    country: string | null;
    start_date: string;
    end_date: string;
    year: number;
};
// TODO: HabLine_2019
export type History = {
    events: Event[];
    awards: Award[];
};
// TODO: InitLineRobot_2020
export type LeaderboardInsight = {
    data: {
        rankings: {
            value: number;
            keys: string[];
        }[];
        key_type: string;
    };
    name: string;
    year: number;
};
export type Match = {
    key: string;
    comp_level: "qm" | "ef" | "qf" | "sf" | "f";
    set_number: number;
    match_number: number;
    alliances: {
        red: Match_alliance;
        blue: Match_alliance;
    };
    winning_alliance: string;
    event_key: string;
    time: number | null;
    actual_time: number | null;
    predicted_time: number | null;
    post_result_time: number | null;
    score_breakdown: any | null;
    videos: {}[];
};
// TODO: Match_Score_Breakdown_2015
// TODO: Match_Score_Breakdown_2015_Alliance
// TODO: Match_Score_Breakdown_2016
// TODO: Match_Score_Breakdown_2016_Alliance
// TODO: Match_Score_Breakdown_2017
// TODO: Match_Score_Breakdown_2017_Alliance
// TODO: Match_Score_Breakdown_2018
// TODO: Match_Score_Breakdown_2018_Alliance
// TODO: Match_Score_Breakdown_2019
// TODO: Match_Score_Breakdown_2019_Alliance
// TODO: Match_Score_Breakdown_2020
// TODO: Match_Score_Breakdown_2020_Alliance
// TODO: Match_Score_Breakdown_2022
// TODO: Match_Score_Breakdown_2022_Alliance
// TODO: Match_Score_Breakdown_2023
// TODO: Match_Score_Breakdown_2023_Alliance
// TODO: Match_Score_Breakdown_2024
// TODO: Match_Score_Breakdown_2024_Alliance
// TODO: Match_Score_Breakdown_2025
// TODO: Match_Score_Breakdown_2025_Alliance
// TODO: Match_Score_Breakdown_2026
// TODO: Match_Score_Breakdown_2026_Alliance
export type Match_Simple = {
    key: string;
    comp_level: string;
    set_number: number;
    match_number: number;
    alliances: {
        red: Match_alliance;
        blue: Match_alliance;
    };
    winning_alliance: string;
    event_key: string;
    time: number | null;
    predicted_time: number | null;
    actual_time: number | null;
};
// TODO: Match_Timeseries_2018
export type Match_alliance = {
    score: number;
    team_keys: string[];
    surrogate_team_keys: string[];
    dq_team_keys: string[];
};
export type Media = {
    type: string;
    foreign_key: string;
    details: object;
    preferred: boolean;
    team_keys: string[];
    direct_url: string;
    view_url: string;
};
export type MobilityRobot_2023 = "No" | "Yes";
export type NotablesInsight = {
    data: {
        entries: {
            context: string[];
            team_key: string;
        }[];
    };
    name: string;
    year: number;
};
// TODO: Position_2016
// TODO: PreMatchBay_2019
export type ReefRow_2025 = {
    nodeA: boolean;
    nodeB: boolean;
    nodeC: boolean;
    nodeD: boolean;
    nodeE: boolean;
    nodeF: boolean;
    nodeG: boolean;
    nodeH: boolean;
    nodeI: boolean;
    nodeJ: boolean;
    nodeK: boolean;
    nodeL: boolean;
};
export type Regional_Advancement = {
    cmp: boolean;
    cmp_status: string;
    qualifying_event: string;
    qualifying_award_name: string;
    qualifying_pool_week: number;
};
export type Regional_Ranking = {
    team_key: string;
    rank: number;
    rookie_bonus: number;
    single_event_bonus: number;
    point_total: number;
    event_points: {
        total: number;
        alliance_points: number;
        elim_points: number;
        award_points: number;
        event_key: string;
        qual_points: number;
    }[];
};
// TODO: RobotAuto_2016_WithUnknown
// TODO: RobotAuto_2016_WithoutUnknown
// TODO: RobotAuto_2017
export type SearchIndex = {
    teams: {
        key: string;
        nickname: string;
    }[];
    events: {
        key: string;
        name: string;
    }[];
};
// TODO: Stage3TargetColor_2020
// TODO: TaxiRobot_2022
export type Team = {
    key: string;
    team_number: number;
    nickname: string;
    name: string;
    school_name: string | null;
    city: string | null;
    state_prov: string | null;
    country: string | null;
    address: string | null;
    postal_code: string | null;
    gmaps_place_id: string | null;
    gmaps_url: string | null;
    lat: number | null;
    lng: number | null;
    location_name: string | null;
    website: string | null;
    rookie_year: number | null;
    motto: string | null;
};
export type Team_Event_Status = {
    qual: Team_Event_Status_rank | null;
    alliance: Team_Event_Status_alliance | null;
    playoff: Team_Event_Status_playoff | null;
    alliance_status_str: string;
    playoff_status_str: string;
    overall_status_str: string;
    next_match_key: string | null;
    last_match_key: string | null;
};
export type Team_Event_Status_alliance = {
    name: string | null;
    number: number;
    backup: Team_Event_Status_alliance_backup | null;
    pick: number;
};
export type Team_Event_Status_alliance_backup = {
    out: string;
    in: string;
};
export type Team_Event_Status_playoff = {
    level: string;
    current_level_record: WLT_Record | null;
    record: WLT_Record | null;
    status: string;
    playoff_average: number | null;
};
export type Team_Event_Status_rank = {
    num_teams: number;
    ranking: {
        matches_played: number;
        qual_average: number | null;
        sort_orders: number[] | null;
        record: WLT_Record | null;
        rank: number | null;
        dq: number | null;
        team_key: string;
    } | null;
    sort_order_info:
        | {
              precision: number;
              name: string;
          }[]
        | null;
    status: string;
};
export type Team_Robot = {
    year: number;
    robot_name: string;
    key: string;
    team_key: string;
};
export type Team_Simple = {
    key: string;
    team_number: number;
    nickname: string;
    name: string;
    city: string | null;
    state_prov: string | null;
    country: string | null;
};
// TODO: Touchpad_2017
// TODO: TowerFace_2016
export type WLT_Record = {
    losses: number;
    wins: number;
    ties: number;
};
export type Webcast = {
    type: string;
    channel: string;
    date: string | null;
    file: string | null;
};
export type Zebra = {
    key: string;
    times: number[];
    alliances: {
        red: Zebra_team[];
        blue: Zebra_team[];
    }[];
};
export type Zebra_team = {
    team_key: string;
    xs: number[];
    ys: number[];
};
