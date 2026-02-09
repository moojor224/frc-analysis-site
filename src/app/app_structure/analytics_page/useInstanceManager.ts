import React, { useMemo, useState } from "react";

type Instance<T> = {
    element: React.ReactElement<T>;
    id: number;
};

type InstanceManager<T> = {
    readonly id: number;
    instances: (Instance<T> | undefined)[];
    removeInstance(index: number): void;
    addInstance(args: T): void;
    refresh(): void;
};

export function useInstanceManager<Props extends {}>(
    Component: React.FunctionComponent<Props & { manager: InstanceManager<Props> }>,
    defaultProps: (tabid: number) => Props,
    startingTabs: (number | void)[] = []
) {
    const [, setInstances] = useState([] as typeof manager.instances);
    const manager: InstanceManager<Props> = useMemo(() => {
        const manager = {
            id: 0,
            instances: [] as (Instance<Props> | undefined)[],
            removeInstance(index: number) {
                if (index < this.instances.length && index >= 0 && index % 1 === 0) {
                    this.instances = Array.from(this.instances);
                    this.instances[index] = undefined;
                    setInstances(this.instances);
                }
            },
            addInstance(props: Props) {
                this.instances = Array.from(this.instances);
                this.instances.push({
                    element: React.createElement(Component, Object.assign(Object.assign({}, props), { manager, key: this.id })),
                    id: this.id
                });
                this.id++;
                setInstances(this.instances);
            },
            refresh() {
                this.instances = Array.from(this.instances);
                setInstances(this.instances);
            }
        };
        startingTabs.forEach((id) => {
            // console.log("checking existing id", id);
            if (typeof id == "number") {
                const props = defaultProps(id);
                // console.log("add instance with props: ", props);
                manager.addInstance(props);
            } else {
                manager.instances.push(undefined);
                manager.id++;
            }
        });
        return manager;
    }, []);
    return manager;
}
