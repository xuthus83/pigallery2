var webpack = require('webpack');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
var path = require("path");

module.exports = {
    entry: {
        'app': path.join(__dirname,'/main.ts')
    },
    output: {
        filename: path.join(__dirname,'/dist/[name]-bundle.js'),
        library: ['peer']
    },
    // Turn on sourcemaps
    //devtool: 'source-map',
    resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.js'],

        modulesDirectories: [
            'node_modules',
            'lib'
        ]
    },
    // Add minification
    plugins: [
    ],
    module: {
        loaders: [
            // Support for .ts files.
            { test: /\.ts$/, loader: 'ts-loader', exclude: [ /\.(spec|e2e)\.ts$/ ] },

            // Support for *.json files.
            { test: /\.json$/,  loader: 'json-loader' },

            // Support for CSS as raw text
            { test: /\.css$/,   loader: 'raw-loader' },

            // support for .html as raw text
            { test: /\.html$/,  loader: 'raw-loader', exclude: [ 'index.html' ] }

        ]
    }


};