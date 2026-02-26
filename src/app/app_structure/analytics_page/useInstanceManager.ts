import { PersistPrefixKeyContext } from "@/app/page.js";
import React, { useContext, useMemo, useState } from "react";

type Instance = {
    element: React.ReactElement;
    id: number;
};

type InstanceManager = {
    instances: (Instance | undefined)[];
    removeInstance(index: number): void;
    addInstance(): Instance;
    refresh(): void;
};
export function useInstanceManager(
    Component: React.FunctionComponent<{ id: number; manager: InstanceManager }>,
    startingTabs: number[] = []
) {
    console.log("useInstanceManager", startingTabs, useContext(PersistPrefixKeyContext));
    const [, setInstances] = useState([] as typeof manager.instances);
    const manager: InstanceManager = useMemo(() => {
        const manager = {
            instances: [] as (Instance | undefined)[],
            removeInstance(index: number) {
                if (index < this.instances.length && index >= 0 && index % 1 === 0) {
                    this.instances = Array.from(this.instances);
                    this.instances[index] = undefined;
                    setInstances(this.instances);
                }
            },
            addInstance(id: number = 0) {
                const ids = new Set(this.instances.filter((e) => e).map((e) => e!.id));
                while (true) {
                    if (!ids.has(id)) break;
                    id++;
                }
                this.instances = Array.from(this.instances);
                const instance = {
                    element: React.createElement(Component, { id, manager, key: id }),
                    id
                };
                this.instances.push(instance);
                setInstances(this.instances);
                return instance;
            },
            refresh() {
                this.instances = Array.from(this.instances);
                setInstances(this.instances);
            }
        };
        startingTabs.forEach((id) => {
            // console.log("checking existing id", id);
            if (typeof id == "number") {
                // console.log("add instance with props: ", props);
                manager.addInstance(id);
            }
        });
        return manager;
    }, []);
    return manager;
}
