/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function getWebpackConfig(outputPath, templateData) {
  return {
    entry: path.resolve(__dirname, './template/index.js'),
    output: {
      path: path.resolve(__dirname, 'out', `.${outputPath}`),
      filename: 'bundle.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './template/index.html'),
      }),
      new webpack.DefinePlugin({
        templateData: JSON.stringify(templateData),
      }),
    ],
    resolve: {
      alias: {
        '@elastic/eui$': '@elastic/eui/lib',
      }
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: require('@kbn/babel-preset/webpack_preset'),
          },
        }, {
          test: /\.s?css$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        }, {
          test: /\.(gif|png|jpe?g|svg)$/,
          loader: ['file-loader', 'image-webpack-loader'],
        }
      ],
    }
  };
}

module.exports = getWebpackConfig;
