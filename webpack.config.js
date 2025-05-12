const defaultConfig = require( "@wordpress/scripts/config/webpack.config" );
const path = require( "path" );
const MiniCssExtractPlugin = require( "mini-css-extract-plugin" );
const DependencyExtractionWebpackPlugin = require( "@wordpress/dependency-extraction-webpack-plugin" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );

module.exports = {
    ...defaultConfig,

    entry: {
        index: "./src/index.tsx",
        "block/stock-notification-block/index":
            "./src/block/stock-notification-block/index.tsx",
    },

    output: {
        ...defaultConfig.output,
        path: path.resolve( __dirname, "assets" ),
        filename: "js/[name].js",
        chunkFilename: "chunks/[name].[contenthash].js",
        clean: true,
    },

    optimization: {
        ...defaultConfig.optimization,
        splitChunks: {
            chunks: "all",
            minSize: 0,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name( module ) {
                        const packagePath = module.context.match(
                            /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                        );
                        if ( ! packagePath ) return "externals/vendor"; // fallback
                        const packageName = packagePath[ 1 ]
                            .replace( "@", "" )
                            .replace( "/", "-" );
                        return `externals/vendor-${ packageName }`;
                    },
                    chunks: "all",
                    priority: -10,
                    reuseExistingChunk: true,
                },
                components: {
                    test: /[\\/]src[\\/]components[\\/]/,
                    name: "components",
                    minChunks: 1,
                    priority: 10,
                    reuseExistingChunk: true,
                },
            },
        },
    },

    watchOptions: {
        ignored: /node_modules/,
    },

    module: {
        ...defaultConfig.module,
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                include: path.resolve( __dirname, "./src" ),
            },
            {
                test: /\.css$/,
                use: [ "style-loader", "css-loader" ],
                include: /node_modules/,
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: "asset/resource", // ✅ Replace file-loader with Webpack 5's built-in handling
                generator: {
                    filename: "images/[name][hash][ext]", // ✅ Output folder and name pattern
                },
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader, // 🔄 Replaces 'style-loader'
                    {
                        loader: "css-loader",
                        options: {
                            url: true,
                            importLoaders: 2,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [ require( "autoprefixer" ) ],
                            },
                        },
                    },
                    "sass-loader",
                ],
            },
            {
                test: /\.(woff(2)?|ttf|eot|otf|svg)$/i,
                type: "asset/resource",
                generator: {
                    filename: "fonts/[name][hash][ext][query]",
                },
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin( {
            filename: "styles/[name].css",
        } ),
        new DependencyExtractionWebpackPlugin( {
            outputFormat: "php",
            injectPolyfill: true,
        } ),
        new CopyWebpackPlugin( {
            patterns: [
                {
                    from: path.resolve(
                        __dirname,
                        "node_modules/zyra/build/assets/fonts"
                    ),
                    to: path.resolve( __dirname, "dist/fonts" ),
                },
            ],
        } ),
    ],

    resolve: {
        extensions: [ ".ts", ".tsx", ".js", ".jsx" ],
        modules: [ "node_modules" ],
        alias: {
            "@": path.resolve( __dirname, "./src" ), // So you can use "@/assets/..." in SCSS or imports
        },
    },

    externals: {
        react: "React",
        "react-dom": "ReactDOM",
        "@wordpress/element": [ "wp", "element" ],
        "@wordpress/i18n": [ "wp", "i18n" ],
        "@wordpress/components": [ "wp", "components" ],
        "@wordpress/data": [ "wp", "data" ],
        "@wordpress/hooks": [ "wp", "hooks" ],
        "@wordpress/plugins": [ "wp", "plugins" ],
        "@wordpress/blocks": [ "wp", "blocks" ],
        "@wordpress/block-editor": [ "wp", "blockEditor" ],
    },
};
