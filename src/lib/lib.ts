export const Tabs = {
    /** DON'T USE THIS ONE */
    None: "None",
    Home: "Home",
    Season: "Season Analysis",
    Event: "Event Analysis"
} as const;
export type TabKeys = (typeof Tabs)[keyof typeof Tabs];
