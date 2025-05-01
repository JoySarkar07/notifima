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
        use: 'ts-loader',
        include: path.resolve(__dirname, './src'),
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
        include: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource', // ✅ Replace file-loader with Webpack 5's built-in handling
        generator: {
          filename: 'assets/images/[name][hash][ext]', // ✅ Output folder and name pattern
        },
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: true, // ✅ Ensures `url()` in SCSS is processed
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [require('autoprefixer')],
              },
            },
          },
          'sass-loader',
        ],
        include: path.resolve(__dirname, './src'),
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, './src'), // So you can use "@/assets/..." in SCSS or imports
    },
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
