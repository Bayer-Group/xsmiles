const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = [
    {
        target: "web",
        entry: path.resolve(__dirname, "src", "index.tsx"), //"./src/index.tsx",
        output: {
            path: path.resolve(__dirname, "dist", "web"),
            filename: "index.js",
            // filename: "[name].[contenthash].min.js",
        },
        resolve: {
            extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
            symlinks: false,
        },
        watchOptions: {
            followSymlinks: true,
            // ignored: ["out"], // try to get changes from node_modules too - since we are developing the other library together with this app
            // poll: 1000, // Check for changes every second
            // ignored: [/node_modules([\\]+|\/)+(?!extended-smiles)/],
        },
        snapshot: {
            managedPaths: [path.resolve(__dirname, "../node_modules")],
            immutablePaths: [],
            buildDependencies: {
                hash: true,
                timestamp: true,
            },
            module: {
                hash: true,
                timestamp: true,
            },
            resolve: {
                hash: true,
                timestamp: true,
            },
            resolveBuildDependencies: {
                hash: true,
                timestamp: true,
            },
        },
        devServer: {
            static: {
                directory: path.join(__dirname, "public"),
            },
            // liveReload: true,
            // open: true,
            // hot: false,
            watchFiles: ["src/**/*", "public/**/*", "node_modules/extended-smiles-drawer/dist/index.js"],
            // client: { progress: true },
        },

        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    loader: "ts-loader",
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: ["sass-loader"],
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, "public", "index.html"),
            }),
            // new CopyPlugin({
            //     patterns: [
            //       { from: "public/rdkit", to: "rdkit" },                 
            //     ],
            //   }),
        ],
    },
    {
        entry: "./src/module.tsx",
        output: {
            path: path.resolve(__dirname, "dist/module/"),
            filename: "index.js",
            // library: "XaiSmilesSingleView",
            // libraryTarget: "umd",
            libraryTarget: "commonjs2",
        },
        resolve: {
            extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
            symlinks: false,
            // alias: {
            //     react: path.resolve("./node_modules/react"),
            // },
        },

        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    loader: "ts-loader",
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: ["sass-loader"],
                },
            ],
        },
    },
    {
        entry: "./src/module.tsx",
        output: {
            path: path.resolve(__dirname, "dist/plain/"),
            filename: "index.js",
            // library: "XaiSmilesSingleView",
            libraryTarget: "umd",
            library: "xsmiles"
            // libraryTarget: "commonjs2",
        },
        // devtool: "source-map",
        resolve: {
            extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
            symlinks: false,
            // alias: {
            //     react: path.resolve("./node_modules/react"),
            // },
        },

        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    loader: "ts-loader",
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: ["sass-loader"],
                },
            ],
        },
    },
];
