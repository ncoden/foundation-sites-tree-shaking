const gulp = require('gulp');
const loadPlugins = require('gulp-load-plugins');
const del = require('del');
const path = require('path');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const manifest = require('./package.json');

// Load all of our Gulp plugins
const $ = loadPlugins();

// Gather the library data from `package.json`
const config = manifest.babelBoilerplateOptions;
const mainFile = manifest.main;
const destinationFolder = path.dirname(mainFile);
const exportFileName = path.basename(mainFile, path.extname(mainFile));

function cleanDist(done) {
  del([destinationFolder]).then(() => done());
}

function build() {
  return gulp.src(path.join('src', config.entryFileName))
    .pipe(webpackStream({
      mode: 'production',
      output: {
        filename: `${exportFileName}.js`,
        libraryTarget: 'umd',
        library: config.mainVarName
      },
      externals: {},
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: [
                    ["@babel/preset-env", { "loose": true, "modules": false }] // IMPORTANT
                  ]
                }
              }
            ]
          }
        ]
      },
      plugins: [
        new webpack.LoaderOptionsPlugin({
          minimize: true,
          debug: false
        }),
      ],
    }))
    .pipe(gulp.dest(destinationFolder))
    .pipe($.filter(['**', '!**/*.js.map']))
    .pipe($.rename(`${exportFileName}.min.js`))
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.uglify())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(destinationFolder));
}

// Remove the built files
gulp.task('clean', cleanDist);

// Build two versions of the library
gulp.task('build', ['clean'], build);
