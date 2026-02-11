// lmao this file is absolutely cursed, imo. just run it with `node src/api/gen.js` and copy the output class to index.ts
// last api update: https://github.com/the-blue-alliance/the-blue-alliance/blob/d0c8e4fddd19175422630c865cd6baec93a6f8ff/src/backend/web/static/swagger/api_v3.json

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

function gen(name, type, path, desc) {
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

const typesName = "types";
const methods = [];

Object.entries(paths).forEach(([funcName, funcData]) => {
    methods.push(gen(funcName, funcData.type, funcData.path, funcData.description));
});

const clss = `
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
    ${methods.join("\n").trim()}
}`;

fs.writeFileSync("out.ts", clss);
