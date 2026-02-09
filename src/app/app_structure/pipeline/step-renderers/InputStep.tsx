import { PersistPrefixKeyContext } from "@/app/page.js";
import { Button, Divider, FormControl, FormHelperText, Grid } from "@mui/material";
import { useContext, useMemo, useState } from "react";
import type { Input, Step } from "../index.js";
import NumberPipelineStep from "./inputs/Number.js";
import SelectPipelineStep from "./inputs/Select.js";

export default function InputStepComponent({
    step,
    onSubmit,
    prevData
}: {
    step: Step & { kind: "inputs" };
    onSubmit: (value: any) => void;
    prevData: any;
}) {
    const analyticsPageTabInputstepPrefix = useContext(PersistPrefixKeyContext);
    const inputs: Input[] = useMemo(() => {
        [];
        if (typeof step.inputs === "function") {
            return step.inputs(prevData);
        } else if (Array.isArray(step.inputs)) {
            return step.inputs;
        }
        return [];
    }, [step]);
    const [values, setValues] = useState<any[]>(
        inputs.map((e) => {
            // initialize array of inputs with raw inputs pre-filled
            if (e.type === "raw") return e.data;
            return undefined;
        })
    );
    function makeSetter(index: number) {
        return function (value: any) {
            values[index] = value;
            setValues(Array.from(values));
        };
    }
    const hasInputs = values.filter((e) => e !== undefined && e !== null).length === inputs.length;
    return (
        <div className="paper">
            {step.divider ? <Divider variant="fullWidth" /> : null}
            <br />
            <Grid container spacing={2} direction="row">
                {inputs.map((input, index) => (
                    <PersistPrefixKeyContext value={`${analyticsPageTabInputstepPrefix}-input${index}`}>
                        {(() => {
                            switch (input.type) {
                                case "number":
                                    return (
                                        <NumberPipelineStep
                                            key={index}
                                            name={input.name}
                                            min={input.min}
                                            max={input.max}
                                            setValue={makeSetter(index)}
                                        />
                                    );
                                case "select":
                                    return (
                                        <SelectPipelineStep
                                            input={input}
                                            key={index}
                                            name={input.name}
                                            setValue={makeSetter(index)}
                                        />
                                    );
                                case "autocomplete": {
                                    return <div>autocomplete input not implemented yet</div>;
                                }
                                case "string": {
                                    return <div>string imput not implemented yet</div>;
                                }
                                case "raw": {
                                    return null; // raw inputs are hardcoded data
                                }
                                default:
                                    return null;
                            }
                        })()}
                    </PersistPrefixKeyContext>
                ))}
                <FormControl>
                    <Button
                        sx={{ textTransform: "none", height: "40px" }}
                        variant="outlined"
                        onClick={() => {
                            if (hasInputs) {
                                // console.debug("submitting", values);
                                onSubmit(values);
                            } else {
                                console.warn("not all data is selected");
                            }
                        }}
                    >
                        {step.buttonLabel}
                    </Button>
                    <FormHelperText>&nbsp;</FormHelperText>
                </FormControl>
            </Grid>
        </div>
    );
}
