const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const NpmInstallPlugin = require('npm-install-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Load *package.json* so we can use `dependencies` from there
const pkg = require('./package.json');

const TARGET = process.env.npm_lifecycle_event;
const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

process.env.BABEL_ENV = TARGET;

const common = {
// Entry accepts a path or an object of entries. We'll be using the
// latter form given it's convenient with more complex configurations
  entry: {
    app: PATHS.app
  },
  // Add resolve.extentions.
  // '' is needed to allow imports without an extention
  // Note the .'s before extentions as it will fail to match without!!!
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: PATHS.build,
    // Output using entry name
    filename: '[name].[chunkhash].js',
    chunkFilename: '[chunkhash].js'
  },
  module: {
    loaders: [
      {
        // Test expects a RegExp! Note the slashes@
        test: /\.css$/,
        loaders: ['style', 'css'],
        // Include accepts either a path or an array of paths.
        include: PATHS.app
      },
      // Set up jsx. This accepts js too thanks to RegExp
      {
        test: /\.jsx?$/,
        // Enable caching for improved performance during development
        // It uses default OS  directory by default. If you need something
        // more custom, pass a path to it. I.e., babel?cacheDirectory=<path>
        loaders: ['babel?cacheDirectory'],
        // Parse only app files! Without this it will go through entire project.
        // In addition to being slow, that will most likely result in an error.
        include: PATHS.app
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'node_modules/html-webpack-template/index.ejs',
      title: 'Kanban app',
      appMountId: 'app',
      inject: false
    })
  ]
};

// Default configuration
if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devtool: 'eval-source-map',
    devServer: {
      // enable history API fallback so HTML5 History API based
      // routing works. This is a good default that will come in
      // handy in more complex setups.
      historyApiFallback: true,
      hot: true,
      inline: true,
      process: true,
      // Display only errors to reduce the amount of output.
      stats: 'errors-only',
      // Parse host and port from env so this is easy to customize.
      // If you use Vagrant or Cloud9 set
      // host: process.env.HOST || '0.0.0.0';
      // 0.0.0.0 is available to all network devices unlike default localhost
      host: process.env.HOST,
      port: process.env.PORT
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new NpmInstallPlugin({
        save: true // --save
      })
    ]
  });
}

if(TARGET === 'build') {
  module.exports = merge(common, {
    // Define vendor entry point needed for splitting
    entry: {
      vendor: Object.keys(pkg.dependencies).filter(function(v){
        // Exclude alt-utils as it won't work with this setup
        // due to the way the package has been designed (no package.json main).
        return v !== 'alt-utils';
      })
    },
    plugins: [
      // Extract vendor and manifest files
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      }),
      // Setting DefinePlugin affects React library size!
      // DefinePlugin replaces content "as is" so we need some extra quotes
      // for the generated code to make sense
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  });
}
