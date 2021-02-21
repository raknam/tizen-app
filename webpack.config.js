const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'assets/js/bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: [
                            ["@babel/plugin-proposal-class-properties", { "loose": true }]
                        ],
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};