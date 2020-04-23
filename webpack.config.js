const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');

module.exports = (env = {}) => {
    const {prod} = env 
    return {
        mode: prod ? 'production' : 'development',
        devtool: prod ? 'source-map' : 'cheap-module-eval-source-map',
        entry: path.resolve(__dirname, './src/main.ts'),
        output: {
            path: path.resolve(__dirname, './dist'),
            publicPath: '/dist/'
        },
        
        resolve: {
            extensions: ['.ts', '.js', '.vue', '.json'],
            alias: {
                // this isn't technically needed, since the default `vue` entry for bundlers
                // is a simple `export * from '@vue/runtime-dom`. However having this
                // extra re-export somehow causes webpack to always invalidate the module
                // on the first HMR update and causes the page to reload.
                'vue': '@vue/runtime-dom'
            }
        },
        
        module: {
            rules: [{
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    appendTsSuffixTo: [/\.vue$/]
                }
            }, {
                test: /\.vue$/,
                use: 'vue-loader'
            }, {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    prod ? MiniCssExtractPlugin.loader : 'style-loader',
                    'css-loader',
                    {
                        loader: `postcss-loader`,
                        options: {
                            plugins: () => [autoprefixer()],
                            options: {
                                
                            },
                        }
                    },
                    'sass-loader',
                ],
            }]
        },
        
        plugins: [
            new VueLoaderPlugin(),
            new MiniCssExtractPlugin({
                filename: 'css/[name].css',
                chunkFilename: 'css/[id].[hash].css'
            })
        ],
        
        devServer: {
            inline: true,
            hot: true,
            stats: 'minimal',
            contentBase: __dirname,
            overlay: true
        }
    };
};