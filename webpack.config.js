const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
  ...defaultConfig,

  entry: {
    index: './src/index.tsx',
  },

  output: {
    ...defaultConfig.output,
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
    chunkFilename: 'chunks/[name].[contenthash].js',
    clean: true,
  },

  optimization: {
    ...defaultConfig.optimization,
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packagePath = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
            if (!packagePath) return 'vendor'; // fallback
            const packageName = packagePath[1].replace('@', '').replace('/', '-');
            return `vendor-${packageName}`;
          },
          chunks: 'all',
          priority: -10,
          reuseExistingChunk: true,
        },
        components: {
          test: /[\\/]src[\\/]components[\\/]/,
          name: 'components',
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
        use: 'ts-loader',  // If you need specific TS handling, otherwise can rely on Babel
        include: path.resolve(__dirname, './src'),
      },
      {
        test: /\.css$/,
        use: [
          'style-loader', // Injects CSS into the DOM
          'css-loader',   // Resolves CSS imports
        ],
        include: /node_modules/,
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        use: [
          {
            loader: 'file-loader', // Handles image files
            options: {
              name: '[name].[hash].[ext]', // Customize output file name and include a hash for cache busting
              outputPath: 'assets/images/', // Place images in the assets/images directory
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader', // Injects styles into the DOM
          'css-loader',   // Resolves CSS imports
          {
            loader: 'postcss-loader', // (Optional) For autoprefixing and other PostCSS features
            options: {
              postcssOptions: {
                plugins: [require('autoprefixer')],
              },
            },
          },
          'sass-loader', // Compiles SCSS to CSS
        ],
        include: path.resolve(__dirname, './src'),
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },

  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    '@wordpress/element': ['wp', 'element'],
    '@wordpress/i18n': ['wp', 'i18n'],
    '@wordpress/components': ['wp', 'components'],
    '@wordpress/data': ['wp', 'data'],
    '@wordpress/hooks': ['wp', 'hooks'],
    '@wordpress/plugins': ['wp', 'plugins'],
    '@wordpress/blocks': ['wp', 'blocks'],
    '@wordpress/block-editor': ['wp', 'blockEditor'],
  },
};
