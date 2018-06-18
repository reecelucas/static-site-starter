const gulp = require('gulp');

// UTILS
const buffer = require('gulp-buffer');
const camelCase = require('camelcase');
const glob = require('glob');
const gulpif = require('gulp-if');
const merge = require('merge-stream');
const minimist = require('minimist');
const path = require('path');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');

// JS
const babel = require('rollup-plugin-babel');
const rollup = require('rollup-stream');
const rollupPluginNodeResolve = require('rollup-plugin-node-resolve');
const rollupPluginCommonjs = require('rollup-plugin-commonjs');
const uglify = require('gulp-uglify');

// SCSS/CSS
const autoprefixer = require('autoprefixer');
const cleanCSS = require('gulp-clean-css');
const cssmqpacker = require('css-mqpacker');
const postcss = require('gulp-postcss');
const postcssDiscardDuplicates = require('postcss-discard-duplicates');
const purify = require('gulp-purifycss');
const sass = require('gulp-sass');

// HTML & IMAGES
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const inlinesource = require('gulp-inline-source');

// Helpers
const CLI_ARGUMENTS = minimist(process.argv.slice(2), { string: 'env' });
const isProduction = CLI_ARGUMENTS.env === 'production';

const files = {
    html: {
        src: './dist/*.html',
        dest: './dist'
    },
    scss: {
        src: './src/styles/**/*.scss',
        dest: './dist/css'
    },
    js: {
        src: './src/js/**/*.js',
        dest: './dist'
    },
    assets: {
        src: './src/assets/**/*',
        dest: './dist/assets'
    },
    copy: {
        src: './src/_headers',
        dest: './dist'
    }
};

gulp.task('inlineCritial', ['assets', 'scss', 'js'], () =>
    gulp
        .src(files.html.src)
        .pipe(inlinesource())
        .pipe(gulp.dest(files.html.dest))
);

gulp.task('html', ['inlineCritial'], () =>
    gulp
        .src(files.html.src)
        .pipe(
            htmlmin({
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true,
                removeComments: true,
                removeEmptyAttributes: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true
            })
        )
        .pipe(gulp.dest(files.html.dest))
);

gulp.task('scss', () => {
    const plugins = [
        autoprefixer(),
        cssmqpacker(), // Combine inline media queries
        postcssDiscardDuplicates() // Remove duplicate style rules
    ];

    return gulp
        .src(files.scss.src)
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sass().on('error', sass.logError))
        .pipe(
            gulpif(
                isProduction,
                purify([files.js.src, files.html.src], { info: true })
            )
        )
        .pipe(gulpif(isProduction, cleanCSS({ compatibility: 'ie10' })))
        .pipe(postcss(plugins))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(files.scss.dest)); // Write sourcemaps to a separate file
});

gulp.task('js', () =>
    merge(
        glob.sync(files.js.src).map(entry => {
            // Take file name from full path & strip `.js` extension
            const fileName = entry.replace(/^.*[\\/]/, '').slice(0, -3);

            return rollup({
                input: entry,
                format: 'iife',
                name: camelCase(fileName),
                sourcemap: true,
                plugins: [
                    babel(),
                    rollupPluginNodeResolve(),
                    rollupPluginCommonjs()
                ]
            }).pipe(source(path.resolve(entry), path.resolve('./src')));
        })
    )
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(gulpif(isProduction, uglify()))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(files.js.dest))
);

gulp.task('assets', () =>
    gulp
        .src(files.assets.src)
        .pipe(
            gulpif(
                isProduction,
                imagemin([
                    imagemin.jpegtran({ progressive: true }),
                    imagemin.optipng({ optimizationLevel: 5 }),
                    imagemin.svgo({
                        plugins: [{ removeViewBox: true }]
                    })
                ])
            )
        )
        .pipe(gulp.dest(files.assets.dest))
);

gulp.task('copy', () =>
    gulp
        .src(files.copy.src)
        .pipe(gulp.dest(files.copy.dest))
);

// Views/templates are watched by `Eleventy`
gulp.task('watch', () => {
    gulp.watch(files.scss.src, () => {
        gulp.run('scss');
    });

    gulp.watch(files.js.src, () => {
        gulp.run('js');
    });

    gulp.watch(files.assets.src, () => {
        gulp.run('assets');
    });
});

gulp.task('default', ['assets', 'scss', 'js', 'copy', 'watch']);
gulp.task('build', ['html', 'assets', 'scss', 'js', 'copy']);
