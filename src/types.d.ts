import { Tabs } from "./app/page.tsx";

export type Page = {
    name: Tabs;
    icon: React.ReactNode;
    TabSelect: ({ tab }: { tab: string }) => React.ReactNode;
    Component: () => React.ReactNode;
};
