// lmao this file is absolutely cursed, imo. just run it with `node src/api/gen.js` and copy the output class to index.ts
// last api update: https://github.com/the-blue-alliance/the-blue-alliance/blob/d0c8e4fddd19175422630c865cd6baec93a6f8ff/src/backend/web/static/swagger/api_v3.json
// raw file: https://github.com/the-blue-alliance/the-blue-alliance/blob/main/src/backend/web/static/swagger/api_v3.json

// run this on https://www.thebluealliance.com/apidocs/v3
function run() {
    console.log(
        '{"": "' +
            Array.from(new Set(Array.from(document.querySelectorAll("[data-path]")).map((e) => e.textContent))).join(
                '",\n"": "'
            ) +
            '"}'
    );
}
import fs from "fs";
import paths from "./api.json" with { type: "json" };

const typesName = "types";
function genTypescript(name, type, path, desc) {
    if (!(name.length > 0 && type.length > 0 && path.length > 0)) return "";
    const args = Array.from(path.matchAll(/{([^}]+)}/g));
    const func = `${desc ? `/** ${desc} */` : ""}${name}(${args
        .map((e) => e[1] + ": string")
        .concat("abort?: AbortController")
        .join(
            ", "
        )}): APIResponse<${typesName}.${type}> {\n    return _fetch(BASE_URL + ${args.length > 0 ? `\`${path.replaceAll("{", "${")}\`` : `"${path}"`}, this.API_KEY, abort);\n}`;
    return func;
}

function genJava(name, type, path, desc) {
    if (!(name.length > 0 && type.length > 0 && path.length > 0)) return "";
    const args = Array.from(path.matchAll(/{([^}]+)}/g));
    const func = `${desc ? `/** ${desc} */` : ""}public ${type} ${name}(${args
        .map((e) => "String " + e[1])
        .join(
            ", "
        )}) throws Exception {\n    return _fetch(BASE_URL + ${args.length > 0 ? `"${path.replaceAll("{", '"+').replaceAll("}", '+"')}"` : `"${path}"`}, this.API_KEY, ${type}.class);\n}`;
    return func;
}

/**
 * @template T
 * @param {T} typeData
 * @param {keyof Exclude<T, string>} type
 */
function getType(typeData, type) {
    if (typeof typeData == "string") {
        return typeData;
    }
    return typeData[type] ?? "";
}

const typescriptMethods = Object.entries(paths).map(([funcName, funcData]) => {
    return genTypescript(funcName, getType(funcData.type, "typescript"), funcData.path, funcData.description);
});
const javaMethods = Object.entries(paths).map(([funcName, funcData]) => {
    return genJava(funcName, getType(funcData.type, "java"), funcData.path, funcData.description);
});

function template(strings, ...keys) {
    return (...values) => {
        const dict = values[values.length - 1] || {};
        const result = [strings[0]];
        keys.forEach((key, i) => {
            const value = Number.isInteger(key) ? values[key] : dict[key];
            result.push(value, strings[i + 1]);
        });
        return result.join("");
    };
}

const typescriptClass = `
class TBAAPI extends EventTarget {
    API_KEY: string;
    status: ${typesName}.API_Status | null = null;
    constructor(apiKey: string) {
        super();
        this.API_KEY = apiKey;
        Promise.all([this.getStatus(), this.getSearchIndex()]).then(([status, searchIndex]) => {
            if (status) {
                this.status = status;
                this.dispatchEvent(new Event("load"));
            } else {
                console.error("api not accessible");
                this.dispatchEvent(new Event("loaderror"));
            }
        });
    }
    on(event: string, callback: () => void) {
        this.addEventListener(event, callback);
    }
    ${typescriptMethods.join("\n").trim()}
}`;
const javaClass = `
    ${javaMethods.join("\n").trim()}
`;

fs.writeFileSync("out.ts", typescriptClass);
fs.writeFileSync("out.java", javaClass);
