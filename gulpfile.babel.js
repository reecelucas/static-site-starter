const gulp = require('gulp');
const browserSync = require('browser-sync');

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
const portscanner = require('portscanner');
const shell = require('gulp-shell');

// JS
const babel = require('rollup-plugin-babel');
const rollup = require('rollup-stream');
const rollupPluginNodeResolve = require('rollup-plugin-node-resolve');
const rollupPluginCommonjs = require('rollup-plugin-commonjs');
const uglify = require('gulp-uglify');

// SCSS/CSS
const autoprefixer = require('autoprefixer');
const cssmqpacker = require('css-mqpacker');
const postcss = require('gulp-postcss');
const postcssDiscardDuplicates = require('postcss-discard-duplicates');
const sass = require('gulp-sass');
const purgecss = require('gulp-purgecss');

// HTML & IMAGES
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const inlinesource = require('gulp-inline-source');

// Helpers
const CLI_ARGUMENTS = minimist(process.argv.slice(2), { string: 'env' });
const isProduction = CLI_ARGUMENTS.env === 'production';
const server = browserSync.create();
const assignAvailablePort = initialPort => {
    let port = initialPort;
    const portInUse = () => {
        portscanner.findAPortInUse(port, () => true);
    };

    while (portInUse(port)) {
        port += 1;
    }

    return port;
};

const paths = {
    templates: {
        src: './src/views/**/*'
    },
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

const serverConfig = {
    open: 'local',
    port: assignAvailablePort(isProduction ? 8080 : 8000),
    server: './dist',
    ui: {
        port: assignAvailablePort(isProduction ? 8081 : 8001)
    },
    watch: !isProduction // "Hot reload" when `html` files change
};

gulp.task('serve', done => {
    server.init(serverConfig);
    done();
});

gulp.task('reload', done => {
    server.reload();
    done();
});

gulp.task('templates', shell.task('eleventy'));

gulp.task('html', ['inlineCritial'], () =>
    gulp
        .src(paths.html.src)
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
        .pipe(gulp.dest(paths.html.dest))
);

gulp.task('scss', () => {
    const plugins = [
        autoprefixer(),
        cssmqpacker(), // Combine inline media queries
        postcssDiscardDuplicates() // Remove duplicate style rules
    ];

    return gulp
        .src(paths.scss.src)
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(
            gulpif(
                isProduction,
                purgecss({
                    content: [paths.html.src, paths.js.src]
                })
            )
        )
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(paths.scss.dest)); // Write sourcemaps to a separate file
});

gulp.task('js', () =>
    merge(
        glob.sync(paths.js.src).map(entry => {
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
        .pipe(gulp.dest(paths.js.dest))
);

gulp.task('assets', () =>
    gulp
        .src(paths.assets.src)
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
        .pipe(gulp.dest(paths.assets.dest))
);

gulp.task('copy', () =>
    gulp.src(paths.copy.src).pipe(gulp.dest(paths.copy.dest))
);

gulp.task('inlineCritial', ['templates', 'assets', 'scss', 'js'], () =>
    gulp
        .src(paths.html.src)
        .pipe(
            inlinesource({
                attribute: 'data-inline'
            })
        )
        .pipe(gulp.dest(paths.html.dest))
);

gulp.task('watch', () => {
    /**
     * We don't call `reload` after running the `templates`
     * task because `BrowserSync` is set up to watch the
     * generated `html` files.
     */
    gulp.watch(paths.templates.src, ['templates']);
    gulp.watch(paths.scss.src, ['scss', 'reload']);
    gulp.watch(paths.js.src, ['js', 'reload']);
    gulp.watch(paths.assets.src, ['assets', 'reload']);
});

gulp.task('default', ['templates', 'scss', 'js', 'assets', 'copy', 'serve', 'watch']);
gulp.task('build', ['html', 'scss', 'js', 'assets', 'copy', 'serve']);
gulp.task('build:server', ['html', 'scss', 'js', 'assets', 'copy']);
