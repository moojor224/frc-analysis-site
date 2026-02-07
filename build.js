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
        fs.rmSync(path.resolve("out"), { recursive: true });
    } catch {}
    fs.mkdir(path.resolve("out"), () => {
        fs.writeFileSync(path.resolve("out", "index.html"), html);
        copy("public/**/*", "out", function (err, files) {
            if (err) throw err;
        });
    });
} catch (err) {
    console.error(err);
}
const end = Date.now();
console.log("Injected in " + (end - start) + "ms");
