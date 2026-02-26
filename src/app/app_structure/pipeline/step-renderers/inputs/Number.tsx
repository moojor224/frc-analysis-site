import { useNumberInput } from "@/app/app_structure/analytics_page/useNumberInput.js";
import { ApiContext } from "@/app/page.js";
import { TBAAPI } from "@moojor224/tba-api";
import { TextField } from "@mui/material";
import { useContext, useEffect } from "react";
import { InputPipelineStep } from "../../PipelineRenderer.js";

const NumberPipelineStep: InputPipelineStep<
    number,
    {
        min?: number;
        max?: number | ((api: TBAAPI) => number);
    }
> = function ({ name, setValue, min, max }) {
    const api = useContext(ApiContext);
    const value = useNumberInput({
        min,
        max: typeof max === "function" ? max(api) : max
    });
    useEffect(() => {
        if (value.has && !value.hasError) {
            setValue(value.value!);
        }
    }, [value.value]);
    return (
        <TextField
            label={name}
            error={value.hasError}
            helperText={value.errorMessage || " "}
            type="number"
            onChange={value.onChange}
            size="small"
            margin="none"
            value={value.value}
        />
    );
};

export default NumberPipelineStep;
