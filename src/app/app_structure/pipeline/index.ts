import { TBAAPI } from "@/lib/tba_api/index.js";

type Narrow<T> = (T extends infer U ? U : never) | Extract<T, any> | ([T] extends [[]] ? [] : { [K in keyof T]: Narrow<T[K]> });

type RawInput<T> = {
    type: "raw";
    data: T;
    validate?: (value: T) => boolean;
};
export type SelectInput<T> = {
    type: "select";
    name: string;
    data: T[];
    key: keyof T;
    label?: keyof T;
    validate?: (value: T) => boolean;
};
type AutocompleteInput<T> = {
    type: "autocomplete";
    name: string;
    data: T[];
    key: keyof T;
};

export type Input<T = any> =
    | {
          type: "string";
          name: string;
          validate?: (value: string) => boolean;
      }
    | {
          type: "number";
          name: string;
          min?: number;
          max?: number | ((api: TBAAPI) => number);
          validate?: (value: number) => boolean;
      }
    | RawInput<any>
    | SelectInput<any>
    | AutocompleteInput<any>;

type ExtractInputValue<I> = I extends { type: "string" }
    ? string
    : I extends { type: "number" }
      ? number
      : I extends { type: "select" }
        ? string
        : I extends RawInput<infer D>
          ? D
          : I extends SelectInput<infer D>
            ? D
            : I extends AutocompleteInput<infer D>
              ? D
              : never;
type ExtractInputValues<T extends readonly Input[]> = {
    [K in keyof T]: ExtractInputValue<T[K]>;
};

interface InputStep<TOut> {
    kind: "inputs";
    inputs: readonly Input<TOut>[] | Narrow<(prev: any) => readonly Input<TOut>[]>;
    buttonLabel: string;
    divider?: boolean;
}

interface TransformStep<TIn, TOut> {
    kind: "transform";
    run: (input: TIn) => Promise<Narrow<TOut>> | Narrow<TOut>;
}
interface ShowStep<TIn> {
    kind: "show";
    render: React.FunctionComponent<{ data: TIn }>;
}
type MessageType = "error" | "info" | "success" | "warning";
interface NullStep {
    kind: "messageIfNone";
    message: string;
    severity: MessageType;
}
interface APIStep<TIn, TOut> {
    kind: "api";
    run: (api: TBAAPI, data: TIn) => Promise<Narrow<TOut>>[];
}

type StepKind = "inputs" | "transform" | "messageIfNone" | "show" | "api";
export type Step = { kind: StepKind } & (
    | InputStep<any>
    | TransformStep<any, any>
    | ShowStep<any>
    | NullStep
    | APIStep<any, any>
);
type ArrayToTuple<T extends readonly any[]> = {
    [K in keyof T]: Awaited<T[K]>;
};

// TODO: make an indexedSearch step
class PipelineBuilder<TCurrent> {
    private readonly steps: Step[] = [];
    constructor(steps: Step[], newStep?: Step) {
        if (newStep !== undefined) {
            this.steps = steps.concat(newStep);
        } else {
            this.steps = steps;
        }
    }
    /** display various inputs to get data from the user */
    getInputs<TInputs extends readonly Input[]>(
        inputs: TInputs | ((prev: TCurrent) => TInputs),
        buttonLabel: string,
        divider?: boolean
    ) {
        return new PipelineBuilder<ExtractInputValues<TInputs>>(this.steps, {
            kind: "inputs",
            inputs,
            buttonLabel,
            divider
        });
    }
    /** do something with the data from the previous step */
    then<TNext>(fn: (data: TCurrent) => Promise<Narrow<TNext>> | Narrow<TNext>) {
        return new PipelineBuilder<TNext>(this.steps, {
            kind: "transform",
            run: fn
        });
    }
    /** make an api call */
    api<TNext, T extends any[] = Promise<TNext>[]>(fn: (api: TBAAPI, data: TCurrent) => T) {
        return new PipelineBuilder<ArrayToTuple<T>>(this.steps, {
            kind: "api",
            run: fn
        });
    }
    /** show an arbitrary react component */
    show(render: React.FunctionComponent<{ data: TCurrent }>) {
        return new PipelineBuilder<TCurrent>(this.steps, {
            kind: "show",
            render
        });
    }
    /** show a message if the data from the previous step is null or undefined */
    messageIfNone(message: string, severity: MessageType) {
        return new PipelineBuilder<Exclude<TCurrent, null | undefined>>(this.steps, {
            kind: "messageIfNone",
            message,
            severity
        });
    }
    /** get the list of steps from the pipeline */
    build() {
        return this.steps;
    }
}
export type Pipeline<T> = PipelineBuilder<T>;

export function createPipeline() {
    return new PipelineBuilder<void>([]);
}
