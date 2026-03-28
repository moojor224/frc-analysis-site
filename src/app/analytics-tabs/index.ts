import type { Page } from "@/types";
import EventAnalysis from "./EventAnalysis";
import EventStatus from "./EventStatus";
import Home from "./Home";
import SeasonAnalysis from "./SeasonAnalysis";

export const analyticsPages: Page[] = [/* Home, */ EventAnalysis, SeasonAnalysis, EventStatus];
Home;
