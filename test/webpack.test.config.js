

var path = require('path');
// Webpack Plugins
var ProvidePlugin = require('webpack/lib/ProvidePlugin');
var DefinePlugin  = require('webpack/lib/DefinePlugin');
var ENV = process.env.ENV = process.env.NODE_ENV = 'test';

/*
 * Config
 */
module.exports = {
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['', '.ts', '.js']
    },
    module: {
        preLoaders: [
            {
                test: /\.ts$/,
                loader: 'tslint-loader',
                exclude: [
                    root('node_modules')
                ]
            },
            {
                test: /\.js$/,
                loader: "source-map-loader",
                exclude: [
                    root('node_modules/rxjs')
                ]
            }
        ],
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                query: {
                    "compilerOptions": {
                        "removeComments": true
                    }
                },
                exclude: [ /\.e2e\.ts$/ ]
            },
            { test: /\.json$/, loader: 'json-loader', exclude: [ root('frontend/index.ejs') ] },
            { test: /\.html$/, loader: 'raw-loader', exclude: [ root('frontend/index.ejs') ] },
            { test: /\.css$/,  loader: 'raw-loader', exclude: [ root('frontend/index.ejs') ] }
        ],
        postLoaders: [
            // instrument only testing sources with Istanbul
            {
                test: /\.(js|ts)$/,
                include: root('frontend'),
                loader: 'istanbul-instrumenter-loader',
                exclude: [
                    /\.(e2e|spec)\.ts$/,
                    /node_modules/
                ]
            }
        ]
    },
    plugins: [
        // Environment helpers
        new DefinePlugin({
            'ENV': JSON.stringify(ENV),
            'HMR': false
        })
    ],
    node: {
        global: 'window',
        progress: false,
        crypto: 'empty',
        module: false,
        clearImmediate: false,
        setImmediate: false
    },
    tslint: {
        emitErrors: false,
        failOnHint: false,
        resourcePath: 'src'
    }
};

function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [__dirname+"/../"].concat(args));
}
