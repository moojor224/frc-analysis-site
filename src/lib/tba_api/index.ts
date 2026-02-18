import { createContext } from "react";
import * as types from "./types.js"; // import all types

type Action<T> = () => Promise<T>;

class RateLimiter {
    private rate: number;
    private interval: number;
    private active = 0;
    constructor(rate: number, interval: number = 10) {
        this.rate = rate;
        this.interval = interval;
    }
    run<T>(action: Action<T>): Promise<T> {
        return new Promise<T>((resolve) => {
            const run = async () => {
                if (this.active < this.rate) {
                    this.active++;
                    const result = await action();
                    this.active--;
                    resolve(result);
                } else {
                    setTimeout(run, this.interval);
                }
            };
            run();
        });
    }
}

const rateLimit = new RateLimiter(5);

const BASE_URL = "https://www.thebluealliance.com/api/v3";

/** fetch wrapper to auto-process api responses */
async function _fetch<T>(url: string, API_KEY: string, abort?: AbortController): Promise<null | T> {
    // get api response
    const response = await rateLimit.run(() =>
        fetch(url, { headers: { "X-TBA-Auth-Key": API_KEY }, signal: abort?.signal }).catch((err) => {
        return { status: 400 } as const;
        })
    );
    // check api response status code
    if (response.status === 200) {
        // parse data and return
        return await response.json();
    } else if (response.status === 401) {
        const errorJson = await response.json();
        throw new Error(errorJson?.Error || "Unauthorized"); // not authorized
    } else if (response.status === 404) {
        // not found. shouldn't happen
        const errorJson = await response.json();
        throw new Error(errorJson?.Error || "404 Not Found: " + url);
    }
    return null; // unknown status code
}

type APIResponse<T> = Promise<T | null>;
export const ApiContext = createContext<TBAAPI>(null as unknown as TBAAPI);

export class TBAAPI extends EventTarget {
    API_KEY: string;
    status: types.API_Status | null = null;
    searchIndex: types.SearchIndex | null = null;
    constructor(apiKey: string) {
        super();
        this.API_KEY = apiKey;
        Promise.all([this.getStatus(), this.getSearchIndex()]).then(([status, searchIndex]) => {
            if (status && searchIndex) {
                this.searchIndex = searchIndex;
                this.status = status;
                this.dispatchEvent(new Event("load"));
            } else {
                console.error("api not accessible");
                this.dispatchEvent(new Event("loaderror"));
            }
        });
    }
    on(event: string, callback: () => void) {
        this.addEventListener(event, callback);
    }
    getStatus(abort?: AbortController): APIResponse<types.API_Status> {
        return _fetch(BASE_URL + "/status", this.API_KEY, abort);
    }
    getDistrictDCMPHistory(district_abbreviation: string, abort?: AbortController): APIResponse<types.History[]> {
        return _fetch(BASE_URL + `/district/${district_abbreviation}/dcmp_history`, this.API_KEY, abort);
    }
    getDistrictHistory(district_abbreviation: string, abort?: AbortController): APIResponse<types.District[]> {
        return _fetch(BASE_URL + `/district/${district_abbreviation}/history`, this.API_KEY, abort);
    }
    getDistrictInsights(district_abbreviation: string, abort?: AbortController): APIResponse<types.District_Insight> {
        return _fetch(BASE_URL + `/district/${district_abbreviation}/insights`, this.API_KEY, abort);
    }
    getDisctrictAdvancement(
        district_key: string,
        abort?: AbortController
    ): APIResponse<Record<string, types.District_Advancement>> {
        return _fetch(BASE_URL + `/district/${district_key}/advancement`, this.API_KEY, abort);
    }
    getDistrictAwards(district_key: string, abort?: AbortController): APIResponse<types.Award> {
        return _fetch(BASE_URL + `/district/${district_key}/awards`, this.API_KEY, abort);
    }
    getDistrictEvents(district_key: string, abort?: AbortController): APIResponse<types.Event> {
        return _fetch(BASE_URL + `/district/${district_key}/events`, this.API_KEY, abort);
    }
    getDistrictEventKeys(district_key: string, abort?: AbortController): APIResponse<string[]> {
        return _fetch(BASE_URL + `/district/${district_key}/events/keys`, this.API_KEY, abort);
    }
    getDistrictSimpleEvents(district_key: string, abort?: AbortController): APIResponse<types.Event_Simple[]> {
        return _fetch(BASE_URL + `/district/${district_key}/events/simple`, this.API_KEY, abort);
    }
    getDistrictRankings(district_key: string, abort?: AbortController): APIResponse<types.District_Ranking[]> {
        return _fetch(BASE_URL + `/district/${district_key}/rankings`, this.API_KEY, abort);
    }
    getDistrictTeams(district_key: string, abort?: AbortController): APIResponse<types.Team[]> {
        return _fetch(BASE_URL + `/district/${district_key}/teams`, this.API_KEY, abort);
    }
    getDistrictTeamKeys(district_key: string, abort?: AbortController): APIResponse<string[]> {
        return _fetch(BASE_URL + `/district/${district_key}/teams/keys`, this.API_KEY, abort);
    }
    getDistrictTeamsSimple(district_key: string, abort?: AbortController): APIResponse<types.Team_Simple[]> {
        return _fetch(BASE_URL + `/district/${district_key}/teams/simple`, this.API_KEY, abort);
    }
    getDistrictsByYear(year: string, abort?: AbortController): APIResponse<types.District[]> {
        return _fetch(BASE_URL + `/districts/${year}`, this.API_KEY, abort);
    }
    getTeamDistricts(team_key: string, abort?: AbortController): APIResponse<types.District[]> {
        return _fetch(BASE_URL + `/team/${team_key}/districts`, this.API_KEY, abort);
    }
    getEvent(event_key: string, abort?: AbortController): APIResponse<types.Event> {
        return _fetch(BASE_URL + `/event/${event_key}`, this.API_KEY, abort);
    }
    getEventAdvancementPoints(event_key: string, abort?: AbortController): APIResponse<types.Event_District_Points> {
        return _fetch(BASE_URL + `/event/${event_key}/advancement_points`, this.API_KEY, abort);
    }
    getEventAlliances(event_key: string, abort?: AbortController): APIResponse<types.Elimination_Alliance[]> {
        return _fetch(BASE_URL + `/event/${event_key}/alliances`, this.API_KEY, abort);
    }
    getEventAwards(event_key: string, abort?: AbortController): APIResponse<types.Award[]> {
        return _fetch(BASE_URL + `/event/${event_key}/awards`, this.API_KEY, abort);
    }
    getEventCOPRs(event_key: string, abort?: AbortController): APIResponse<Record<string, types.Event_COPRs>> {
        return _fetch(BASE_URL + `/event/${event_key}/coprs`, this.API_KEY, abort);
    }
    getEventDistrictPoints(event_key: string, abort?: AbortController): APIResponse<types.Event_District_Points> {
        return _fetch(BASE_URL + `/event/${event_key}/district_points`, this.API_KEY, abort);
    }
    getEventInsights(event_key: string, abort?: AbortController): APIResponse<types.Event_Insights> {
        return _fetch(BASE_URL + `/event/${event_key}/insights`, this.API_KEY, abort);
    }
    getEventMatches(event_key: string, abort?: AbortController): APIResponse<types.Match[]> {
        return _fetch(BASE_URL + `/event/${event_key}/matches`, this.API_KEY, abort);
    }
    getEventMatchKeys(event_key: string, abort?: AbortController): APIResponse<string[]> {
        return _fetch(BASE_URL + `/event/${event_key}/matches/keys`, this.API_KEY, abort);
    }
    getEventMatchesSimple(event_key: string, abort?: AbortController): APIResponse<types.Match_Simple[]> {
        return _fetch(BASE_URL + `/event/${event_key}/matches/simple`, this.API_KEY, abort);
    }
    getEventMatchTimeseries(event_key: string, abort?: AbortController): APIResponse<string[]> {
        return _fetch(BASE_URL + `/event/${event_key}/matches/timeseries`, this.API_KEY, abort);
    }
    getEventOPRs(event_key: string, abort?: AbortController): APIResponse<types.Event_OPRS> {
        return _fetch(BASE_URL + `/event/${event_key}/oprs`, this.API_KEY, abort);
    }
    getEventPredictions(event_key: string, abort?: AbortController): APIResponse<types.Event_Predictions> {
        return _fetch(BASE_URL + `/event/${event_key}/predictions`, this.API_KEY, abort);
    }
    getEventRankings(event_key: string, abort?: AbortController): APIResponse<types.Event_Ranking> {
        return _fetch(BASE_URL + `/event/${event_key}/rankings`, this.API_KEY, abort);
    }
    getEventRegionChampPoints(event_key: string, abort?: AbortController): APIResponse<types.Event_District_Points> {
        return _fetch(BASE_URL + `/event/${event_key}/regional_champs_pool_points`, this.API_KEY, abort);
    }
    getEventSimple(event_key: string, abort?: AbortController): APIResponse<types.Event_Simple> {
        return _fetch(BASE_URL + `/event/${event_key}/simple`, this.API_KEY, abort);
    }
    getEventTeamMedia(event_key: string, abort?: AbortController): APIResponse<types.Media[]> {
        return _fetch(BASE_URL + `/event/${event_key}/team_media`, this.API_KEY, abort);
    }
    getEventTeams(event_key: string, abort?: AbortController): APIResponse<types.Team[]> {
        return _fetch(BASE_URL + `/event/${event_key}/teams`, this.API_KEY, abort);
    }
    getTeamEvents(team_key: string, abort?: AbortController): APIResponse<types.Event[]> {
        return _fetch(BASE_URL + `/team/${team_key}/events`, this.API_KEY, abort);
    }
    getTeamEventsByYear(team_key: string, year: string, abort?: AbortController): APIResponse<types.Event[]> {
        return _fetch(BASE_URL + `/team/${team_key}/events/${year}`, this.API_KEY, abort);
    }
    getSearchIndex(abort?: AbortController): APIResponse<types.SearchIndex> {
        return _fetch(BASE_URL + "/search_index", this.API_KEY, abort);
    }
}
