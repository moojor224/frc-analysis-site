import { useInput } from "@/app/app_structure/analytics_page/useInput";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material";
import { useEffect } from "react";
import { type InputPipelineStep } from "../../PipelineRenderer";
import { type SelectInput } from "../../index";

function string(val: string | null | undefined) {
    if (typeof val === "string") {
        return val;
    }
    return "";
}

const SelectPipelineStep: InputPipelineStep<string, { input: SelectInput<any> }> = function ({ input, name, setValue }) {
    const value = useInput<string>();
    useEffect(() => {
        if (value.has && !value.hasError) {
            setValue(value.value!);
        }
    }, [value.value]);
    if (!value.has) {
        value.set(input.data[0]?.[input.key]);
    }
    return (
        <FormControl error={value.hasError}>
            <InputLabel>{name}</InputLabel>
            <Select
                label={name}
                value={value.value}
                onChange={(evt) => value.set(string(evt.target.value))}
                size="small"
                margin="none"
                autoWidth
                sx={{ minWidth: "200px" }}
            >
                {input.data.map((d, idx) => {
                    const val = d[input.key] + "";
                    const label = (() => {
                        if (input.label === undefined) {
                            return val;
                        }
                        return d[input.label];
                    })();
                    return (
                        <MenuItem key={val} value={val}>
                            {label}
                        </MenuItem>
                    );
                })}
            </Select>
            <FormHelperText>{value.errorMessage || " "}</FormHelperText>
        </FormControl>
    );
};

export default SelectPipelineStep;
