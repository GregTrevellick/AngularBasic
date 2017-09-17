import * as ExtractTextPlugin from "extract-text-webpack-plugin";
import * as path from "path";
import * as webpack from "webpack";
import * as UglifyJSPlugin from "uglifyjs-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

module.exports = (env: any) => {
    const extractCSS = new ExtractTextPlugin("vendor.css");
    const prod = env && env.prod as boolean;
    console.log(prod ? "Production" : "Dev" + " vendor build");
    const analyse = env && env.analyse as boolean;
    if (analyse) { console.log("Analysing build"); }
    const outputDir = "./wwwroot/dist";
    const bundleConfig = {
        stats: { modules: false },
        resolve: {
            extensions: [".js"],<% if (pace) { %>
            alias: {
                pace: "pace-progress",
            },<% } %>
        },
        module: {
            rules: [
                { test: /\.(png|woff|woff2|eot|ttf|svg|gif)(\?|$)/, use: "url-loader?limit=100000" },
                { test: /\.css(\?|$)/, use: extractCSS.extract({ use: prod ? "css-loader?minimize" : "css-loader" }) },
            ],
        },
        entry: {
            vendor: [<% if(covalent) { %>
                "@covalent/core/common/platform.css",<% } if(pace) { %>
                "pace-progress/themes/black/pace-theme-center-simple.css",<% } if (primeng) { %>
                "primeng/resources/primeng.min.css",
                "primeng/resources/themes/cruze/theme.css",<% } if(covalent || pace || primeng) { %>
<% } %>
                "@angular/animations",
                "@angular/common",
                "@angular/compiler",
                "@angular/core",
                "@angular/forms",
                "@angular/http",
                "@angular/platform-browser",
                "@angular/platform-browser/animations",
                "@angular/platform-browser-dynamic",
                "@angular/router",<% if(material) { %>
                "@angular/material",<% } if(covalent) { %>
                "@covalent/core",<% } if(pace) { %>
                "pace-progress",<% } if(primeng) { %>
                "primeng/primeng",<% } %>
                "jquery",
                "zone.js",
                "reflect-metadata",
                "core-js",
                "rxjs",
                "css-loader/lib/css-base",
                "core-js/es6/string",
                "core-js/es6/array",
                "core-js/es6/object",
                "core-js/es7/reflect",
                "hammerjs",
            ],
        },
        output: {
            publicPath: "/dist/",
            filename: "[name].js",
            library: "[name]_[hash]",
            path: path.join(__dirname, outputDir),
        },
        node: {
            fs: "empty",
        },
        plugins: [
            new webpack.ProvidePlugin({ $: "jquery", jQuery: "jquery", Hammer: "hammerjs/hammer" }), // Global identifiers
            new webpack.ContextReplacementPlugin(/\@angular\b.*\b(bundles|linker)/, path.join(__dirname, "./ClientApp")), // Workaround for https://github.com/angular/angular/issues/11580
            new webpack.ContextReplacementPlugin(/angular(\\|\/)core(\\|\/)@angular/, path.join(__dirname, "./ClientApp")), // Workaround for https://github.com/angular/angular/issues/14898
            extractCSS,
            new webpack.DllPlugin({
                path: path.join(__dirname, outputDir, "[name]-manifest.json"),
                name: "[name]_[hash]",
            }),
        ].concat(prod ? [
            // Plugins that apply in production builds only
            new UglifyJSPlugin(),
        ] : [
                // Plugins that apply in development builds only
            ]).concat(analyse ? [
                new BundleAnalyzerPlugin({
                    analyzerMode: "static",
                    reportFilename: "vendor.html",
                    openAnalyzer: false,
                }),
            ] : []),
    };
    return bundleConfig;
};
