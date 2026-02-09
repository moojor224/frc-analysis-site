import path from "path";

export default {
    mode: "development",
    // mode: "production",
    entry: "./tsup-out/page.js",
    output: {
        filename: "index.js",
        path: path.resolve("webpack-out"),
        publicPath: ""
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["css-loader"]
            },
            {
                test: /\.svg$/,
                loader: "svg-inline-loader"
            }
        ]
    },
    ignoreWarnings: [
        () => true // ignore all warnings. set to false to print warnings to console when building
    ]
};
