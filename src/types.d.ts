import type { TabKeys } from "./app/page";

export type Page = {
    name: TabKeys;
    icon: React.ReactNode;
    TabSelect: ({ tab }: { tab: string }) => React.ReactNode;
    Component: () => React.ReactNode;
};
