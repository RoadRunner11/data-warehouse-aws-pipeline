const path = require('path');
const webpack = require('webpack');
const colors = require('colors');

// paths are case sensitive when not on windows (e.g. build server)
module.exports = env => {
    return ({
        entry: {
            copyGALandingDataToLegacyBucket: './src/googleAnalytics/copyGALandingDataToLegacyBucket.ts'
        },
        target: 'node',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        externals: {
            'aws-sdk': 'aws-sdk',
        },
        mode: 'production',
        resolve: {
            extensions: ['.tsx', '.ts', '.js']
        },
        output: {
            filename: '[name]/index.js',
            path: path.resolve(__dirname, '.build'),
            libraryTarget: 'umd'
        }
    })
};
