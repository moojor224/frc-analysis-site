import { PersistPrefixKeyContext } from "@/app/page.js";
import { ApiContext } from "@/lib/tba_api/index.js";
import { useDBPersistentValue } from "@/lib/useDBPersistentValue.js";
import { Alert, Box, CircularProgress, CircularProgressProps, Grid, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { Pipeline } from "./index.js";
import ApiError from "./step-renderers/ApiError.js";
import InputStepComponent from "./step-renderers/InputStep.js";

export type InputPipelineStep<T, U = never> = React.FunctionComponent<U & { setValue(value: T): void; name: string }>;

function promiseAllWithProgress<T>(
    promises: Promise<T>[],
    onProgress: (info: { index: number; value?: T; error?: unknown; completed: number; total: number }) => void
): Promise<T[]> {
    let completed = 0;
    const total = promises.length;

    const wrapped = promises.map((_p, index) => {
        let p = _p;
        if (!(p instanceof Promise)) {
            if (typeof _p === "function") {
                p = new Promise(_p);
            } else {
                p = new Promise((r) => r(_p));
            }
        }
        return p.then(
            (value) => {
                completed++;
                onProgress({ index, value, completed, total });
                return value;
            },
            (error) => {
                completed++;
                onProgress({ index, error, completed, total });
                throw error;
            }
        );
    });

    return Promise.all(wrapped);
}

function CircularProgressWithLabel(props: CircularProgressProps & { value: number }) {
    return (
        <Box sx={{ position: "relative", display: "inline-flex" }}>
            <CircularProgress variant="determinate" {...props} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    sx={{ color: "text.secondary" }}
                >{`${Math.round(props.value)}%`}</Typography>
            </Box>
        </Box>
    );
}

function Inner({ pipeline, setOutput }: { pipeline: Pipeline<any>; setOutput(value: any): void }) {
    const analyticsPageTabPrefix = useContext(PersistPrefixKeyContext);
    const [values, setValues] = useDBPersistentValue<any[]>(`${analyticsPageTabPrefix}-valuesarr`, []);
    const [activeStep, setActiveStep] = useDBPersistentValue<number>(`${analyticsPageTabPrefix}-activestep`, 0);
    const [lastRunStep, setLastRunStep] = useDBPersistentValue<number>(`${analyticsPageTabPrefix}-lastrunstep`, -1);
    const [apiError, setApiError] = useState<Error | null>(null);
    const api = useContext(ApiContext);
    const steps = pipeline.build();
    const [progress, setProgress] = React.useState<{ completed: number; total: number }[]>([]);

    useEffect(() => {
        if (activeStep >= steps.length) {
            // all steps processed
            console.info("all steps processed. setting output");
            setOutput(values[values.length - 1]);
        }
    }, [activeStep, values]);
    return (
        <div>
            {steps
                .map((step, index, arr) => {
                    if (index > activeStep) return null;

                    return (
                        <PersistPrefixKeyContext value={`${analyticsPageTabPrefix}-inputstep${index}`}>
                            {(() => {
                                console.debug("running step", index, activeStep, step);

                                function getLastData() {
                                    if (index === 0) return undefined;
                                    return values[index - 1];
                                }
                                switch (step.kind) {
                                    case "inputs":
                                        return (
                                            <InputStepComponent
                                                key={index}
                                                step={step}
                                                prevData={getLastData()}
                                                onSubmit={(value) => {
                                                    console.debug("submitting values from input");
                                                    values[index] = value;
                                                    setValues(Array.from(values));
                                                    setActiveStep(index + 1);
                                                    setLastRunStep(-1);
                                                }}
                                            />
                                        );
                                    case "show":
                                        return (
                                            <div key={index}>
                                                <step.render data={values[index - 1]} />
                                            </div>
                                        );
                                    case "messageIfNone": {
                                        const data = values[index - 1];
                                        if (data === null || data === undefined) {
                                            return (
                                                <Alert key={index} severity={step.severity}>
                                                    {step.message}
                                                </Alert>
                                            );
                                        }
                                        if (activeStep === index) {
                                            values[index] = data;
                                            setValues(Array.from(values));
                                            setActiveStep(index + 1);
                                        }
                                        return null;
                                    }
                                    case "transform": {
                                        if (activeStep === index) {
                                            const oldData = values[index - 1];
                                            const newData = step.run(oldData);
                                            values[index] = newData;
                                            setValues(Array.from(values));
                                            setActiveStep(index + 1);
                                        }
                                        return null;
                                    }
                                    case "api": {
                                        if (activeStep === index && index !== lastRunStep) {
                                            setLastRunStep(index);
                                            setApiError(null);
                                            const oldData = values[index - 1];
                                            const promises: Promise<any>[] = step.run(api, oldData);
                                            setProgress((p) => {
                                                const next = Array.from(p);
                                                next[activeStep] = { completed: 0, total: promises.length };
                                                return next;
                                            });
                                            promiseAllWithProgress(
                                                promises,
                                                function callback({ completed }: { completed: number }) {
                                                    setProgress((p) => {
                                                        const next = Array.from(p);
                                                        next[activeStep] = {
                                                            completed,
                                                            total: promises.length
                                                        };
                                                        return next;
                                                    });
                                                }
                                            )
                                                .then((newData: any) => {
                                                    console.debug("api call done");
                                                    values[index] = newData;
                                                    setValues(Array.from(values));
                                                    setActiveStep(index + 1);
                                                    setLastRunStep(-1);
                                                })
                                                .catch((e) => {
                                                    console.error("error in api call:", e);
                                                    if (e instanceof Error) {
                                                        console.debug("seting raw error");
                                                        setApiError(e);
                                                    } else {
                                                        console.debug("seting parsed error");
                                                        setApiError(new Error(e));
                                                    }
                                                    // values[index - 1 < 0 ? 0 : index - 1] = null;
                                                    // setValues(Array.from(values));
                                                    setActiveStep(index - 1);
                                                });
                                        }
                                        return null;
                                    }
                                    default:
                                        return null;
                                }
                            })()}
                        </PersistPrefixKeyContext>
                    );
                })
                .map((e, idx) => (
                    <div key={idx}>
                        {progress[idx] && progress[idx].completed < progress[idx].total ? (
                            <Grid container justifyContent="center" width="100%">
                                <CircularProgressWithLabel
                                    variant="determinate"
                                    value={(progress[idx].completed * 100) / progress[idx].total}
                                />
                            </Grid>
                        ) : null}
                        {e}
                    </div>
                ))}
            {apiError ? <ApiError error={apiError} /> : null}
        </div>
    );
}

export function PipelineRenderer({ pipeline, setOutput }: { pipeline: Pipeline<any>; setOutput(value: any): void }) {
    return (
        <ErrorBoundary
            FallbackComponent={function ({ error }) {
                if (error instanceof Error) {
                    return (
                        <Alert severity="error">
                            <pre>{error.stack}</pre>
                        </Alert>
                    );
                }
                return (
                    <Alert severity="error">
                        <pre>error: {JSON.stringify(error)}</pre>
                    </Alert>
                );
            }}
        >
            <Inner {...{ pipeline, setOutput }} />
        </ErrorBoundary>
    );
}
