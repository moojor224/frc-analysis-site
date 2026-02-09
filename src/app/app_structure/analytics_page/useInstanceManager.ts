import React, { useMemo, useState } from "react";

type Instance<T> = {
    element: React.ReactElement<T & { id: number }>;
    id: number;
};

type InstanceManager<T> = {
    readonly id: number;
    instances: (Instance<T> | undefined)[];
    removeInstance(index: number): void;
    addInstance(args: T): Instance<T>;
    refresh(): void;
};
export function useInstanceManager<Props extends {}>(
    Component: React.FunctionComponent<Props & { id: number; manager: InstanceManager<Props> }>,
    defaultProps: (tabid: number) => Props,
    startingTabs: number[] = []
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
                const ids = new Set(this.instances.filter((e) => e).map((e) => e!.element.props.id));
                let id = 0;
                while (true) {
                    if (!ids.has(id)) break;
                    id++;
                }
                this.instances = Array.from(this.instances);
                const instance = {
                    element: React.createElement(Component, Object.assign(Object.assign({}, props), { id, manager, key: id })),
                    id
                };
                this.instances.push(instance);
                this.id++;
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
                const props = defaultProps(id);
                // console.log("add instance with props: ", props);
                manager.addInstance(props);
            }
        });
        return manager;
    }, []);
    return manager;
}
