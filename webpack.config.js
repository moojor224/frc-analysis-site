import path from "path";

export default {
    // mode: "development",
    mode: "production",
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
    ],
    resolve: {
        alias: {
            react: "preact/compat",
            "react-dom/test-utils": "preact/test-utils",
            "react-dom": "preact/compat", // Must be below test-utils
            "react/jsx-runtime": "preact/jsx-runtime"
        }
    }
};
