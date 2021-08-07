const { entries, htmlPlugin } = require('../.electron-vue/muti-page.config')

let rendererConfig = {
    entry: entries,

    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({filename: 'styles.css'}),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ].concat(htmlPlugin()),
    output: {
        // 修改filename的[name].js 为[name]/index.js，1、是为了将js文件和html文件归类在一起；2、[name].js时html访问的是绝对路径
        filename: '[name]/index.js',
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '../dist/electron')
    }
}