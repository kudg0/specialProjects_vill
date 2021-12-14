'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const del = require('del');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const babel = require('gulp-babel');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const changed = require('gulp-changed');
const prettier = require('gulp-prettier');
const beautify = require('gulp-jsbeautifier');
const sourcemaps = require('gulp-sourcemaps');
const hash_src = require('gulp-hash-src');
const posthtml = require('gulp-posthtml');
const htmlmin = require('gulp-htmlmin');
const include = require('posthtml-include');
const richtypo = require('posthtml-richtypo');
const expressions = require('posthtml-expressions');
const removeAttributes = require('posthtml-remove-attributes');
const { quotes, sectionSigns, shortWords } = require('richtypo-rules-ru');
var filejsInclude = require('gulp-include');
var inlinesource = require('gulp-inline-source');

/**
 * Основные переменные
 */
const paths = {
  dist: './dist/',
  src: './src',
  maps: './maps',
};
const src = {
  html: paths.src + '/pages/index.html',
  partials: paths.src + '/partials/**/*.html',
  scss: paths.src + '/sass/',
  js: paths.src + '/js/',
};
const dist = {
  html: paths.dist + '/',
  css: paths.dist + '/',
  js: paths.dist + '/',
};

/**
 * Получение аргументов командной строки
 * @type {{}}
 */
const arg = ((argList) => {
  let arg = {},
    a,
    opt,
    thisOpt,
    curOpt;
  for (a = 0; a < argList.length; a++) {
    thisOpt = argList[a].trim();
    opt = thisOpt.replace(/^\-+/, '');

    if (opt === thisOpt) {
      // argument value
      if (curOpt) arg[curOpt] = opt;
      curOpt = null;
    } else {
      // argument name
      curOpt = opt;
      arg[curOpt] = true;
    }
  }

  return arg;
})(process.argv);

/**
 * Очистка папки dist перед сборкой
 * @returns {Promise<string[]> | *}
 */
function clean() {
  return del([paths.dist]);
}
function cleanJsAndCss() {
  if (arg.production === 'true') {
    return del(['./dist/app.js', './dist/app-min.js', './dist/index.css']);
  }
}

/**
 * Инициализация веб-сервера browserSync
 * @param done
 */
function browserSyncInit(done) {
  browserSync.init({
    server: {
      baseDir: paths.dist,
    },
    host: 'localhost',
    port: 9000,
    logPrefix: 'log',
  });
  done();
}

/**
 * Функция перезагрузки страницы при разработке
 * @param done
 */
function browserSyncReload(done) {
  browserSync.reload();
  done();
}

/**
 * Шаблонизация и склейка HTML
 * @returns {*}
 */
function htmlProcess() {
  return gulp
    .src([src.html])
    .pipe(
      posthtml([
        include({ encoding: 'utf8' }),
        expressions(),
        richtypo({
          attribute: 'data-typo',
          rules: [quotes, sectionSigns, shortWords],
        }),
        removeAttributes([
          // The only non-array argument is also possible
          'data-typo',
        ]),
      ]),
    )
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(dist.html))
    .pipe(browserSync.stream());
}

/**
 * Добавление хеша скриптов и стилей в html для бустинга кеша
 * @returns {*}
 */
function hashProcess() {
  return gulp
    .src(paths.dist + '/*.html')
    .pipe(
      hash_src({
        build_dir: paths.dist,
        src_path: paths.dist + '/js',
        exts: ['.js'],
      }),
    )
    .pipe(
      hash_src({
        build_dir: './dist',
        src_path: paths.dist + '/css',
        exts: ['.css'],
      }),
    )
    .pipe(gulp.dest(paths.dist));
}

/**
 * Склейка и обработка scss файлов без минификации
 * Минификации нет, так как дальше эта верстка отдаётся бэкендеру для натяжки на CMS
 * @returns {*}
 */
function scssProcess() {
  const plugins = [autoprefixer({ grid: true }), cssnano()];

  return gulp
    .src([src.scss + 'index.scss'])
    .pipe(sass())
    .pipe(postcss(plugins))
    .pipe(prettier())
    .pipe(cleanCSS())
    .pipe(gulp.dest(dist.css))
    .pipe(browserSync.stream());
}

/**
 * Работа с пользовательским js
 * @returns {*}
 */
function jsProcess() {
  return gulp
    .src([src.js + '/app.js'])
    .pipe(
      filejsInclude({
        extensions: 'js',
        hardFail: true,
        separateInputs: true,
        includePaths: [__dirname + '/bower_components', __dirname + '/src/js'],
      }),
    )
    .pipe(prettier({ singleQuote: true }))
    .pipe(minify())
    .pipe(gulp.dest(dist.js));
}

// Inline sources
function inlineSource() {
  if (arg.production === 'true') {
    return gulp
      .src('dist/index.html')
      .pipe(
        inlinesource({
          compress: false,
        }),
      )
      .pipe(gulp.dest('dist/'))
      .pipe(browserSync.stream());
  }
}

/**
 * Наблюдение за изменениями в файлах
 */
function watchFiles() {
  gulp.watch(
    './src/pages' + '/**/*.*',
    gulp.series(htmlProcess, browserSyncReload),
  );

  gulp.watch(
    './src/partials' + '/**/*.*',
    gulp.series(htmlProcess, browserSyncReload),
  );

  gulp.watch(
    './src/sass' + '/**/*.*',
    gulp.series(scssProcess, browserSyncReload),
  );

  gulp.watch('./src/js' + '/**/*.*', gulp.series(jsProcess, browserSyncReload));
}

const build = gulp.series(
  clean,
  gulp.parallel(htmlProcess, jsProcess, scssProcess),
  inlineSource,
  cleanJsAndCss,
  hashProcess,
);

const watch = gulp.parallel(build, watchFiles, browserSyncInit);

exports.build = build;
exports.default = watch;
