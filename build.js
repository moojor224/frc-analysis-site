// this script takes the webpacked files and copies them directly into the index.html file
import { inlineSource } from "inline-source";
import fs from "node:fs";
import path from "node:path";
import copy from "copy";

const start = Date.now();
const htmlpath = path.resolve("./index.html");

try {
    const html = await inlineSource(htmlpath, {
        compress: true,
        rootpath: path.resolve(""),
        ignore: [],
        handlers: [
            function (source, context) {
                if (source.type === "json") {
                    console.log(source, context);
                    // source.content = "Hey! I'm overriding the file's content!";
                }
            }
        ]
    });
    try {
        fs.rmSync(path.resolve("frc-analysis-site"), { recursive: true });
    } catch {}
    fs.mkdir(path.resolve("frc-analysis-site"), () => {
        fs.writeFileSync(path.resolve("frc-analysis-site", "index.html"), html);
        copy("public/**/*", "frc-analysis-site", function (err, files) {
            if (err) throw err;
        });
    });
} catch (err) {
    console.error(err);
}
const end = Date.now();
console.log("Injected in " + (end - start) + "ms");
