import * as MiniCssExtractPlugin from "mini-css-extract-plugin";
import path = require("path");
import { Configuration, ContextReplacementPlugin, ProvidePlugin } from "webpack";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

export const outputDir = "./wwwroot/dist";

export function isProd(env: any) {
    return env && env.prod as boolean;
}

export const WebpackCommonConfig = (env: any, type: string) => {
    const prod = isProd(env);
    console.log(`${prod ? "Production" : "Dev"} ${type} build`);
    const analyse = env && env.analyse as boolean;
    if (analyse) { console.log("Analysing build"); }
    const cssLoader = prod ? "css-loader?-url&minimize" : "css-loader?-url";
    const outputDir = "./wwwroot/dist";
    const bundleConfig: Configuration = {
        mode: prod ? "production" : "development",
        resolve: {
            extensions: [".ts", ".js"],
            alias: {
                pace: "pace-progress",
            },
        },
        output: {
            path: path.join(__dirname, outputDir),
            filename: "[name].js",
            chunkFilename: "[id].chunk.js",
            globalObject: "this",
            publicPath: "/",
        },
        module: {
            rules: [
                { test: /\.ts$/, loader: prod ? "@ngtools/webpack" : ["awesome-typescript-loader?silent=true", "angular2-template-loader"] }, // can't use AOT with HMR currently https://github.com/angular/angular-cli/issues/1610
                { test: /\.html$/, use: "html-loader?minimize=false" },
                { test: /\.css$/, use: [MiniCssExtractPlugin.loader, cssLoader] },
                { test: /\.scss$/, include: /ClientApp(\\|\/)app/, use: ["to-string-loader", cssLoader, "sass-loader"] },
                { test: /\.scss$/, include: /ClientApp(\\|\/)styles/, use: [MiniCssExtractPlugin.loader, cssLoader, "sass-loader"] },
                { test: /\.(png|jpg|jpeg|gif|woff|woff2|eot|ttf|svg)(\?|$)/, use: "url-loader?limit=100000" },
                { test: /[\/\\]@angular[\/\\].+\.js$/, parser: { system: true } }, // ignore System.import warnings https://github.com/angular/angular/issues/21560
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "[name].css",
            }),
            new ProvidePlugin({ $: "jquery", jQuery: "jquery", Hammer: "hammerjs/hammer" }), // Global identifiers
            new ContextReplacementPlugin(/angular(\\|\/)core(\\|\/)/, path.join(__dirname, "./ClientApp")), // Workaround for https://github.com/angular/angular/issues/14898
        ].concat(analyse ? [
            new BundleAnalyzerPlugin({
                analyzerMode: "static",
                reportFilename: `${type}.html`,
                openAnalyzer: false,
            }),
        ] : []),
        node: {
            fs: "empty",
        },
    };

    return bundleConfig;
};
