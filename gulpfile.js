'use strict';

const path = require('path');
const stream = require('stream');
const gulp = require('gulp');
const sass = require('gulp-sass');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const gzip = require('gulp-gzip');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const htmlTransform = require('html-transform');
const js = require('./gulp-tasks/js-bundle');
const notify = require('./gulp-tasks/notify');
const server = require('./gulp-tasks/server');

const isWatching = ~process.argv.indexOf('watch');
const production = ~process.argv.indexOf('--production') || process.env.NODE_ENV === 'production';
const out = './out';
const src = (pattern, options) => gulp.src(pattern, Object.assign({base: './src'}, options || {}));
const dest = (pattern) => gulp.dest(pattern || out);

gulp.task('style', () => {
    var processors = [autoprefixer({browsers: ['last 3 versions']})];
    if (production) {
        processors.push(cssnano());
    }

    return src('./src/css/*.scss')
    .pipe(sass()).on('error', notify('SCSS Error'))
    .pipe(postcss(processors))
    .pipe(dest());
});

gulp.task('script', () => {
    return src('./src/js/*.js', {read: false})
    .pipe(js({
		debug: !production,
		watch: isWatching
	})).on('error', notify('JavaScript Error'))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(production ? uglify() : pass())
	.pipe(!production ? sourcemaps.write('./') : pass())
    .pipe(dest());
});

gulp.task('html', ['resources'], () => {
    const base = path.resolve(out);
    return src('./src/index.html')
    .pipe(through(function(file, enc, next) {
        var rel = file.relative;
        file.base = base;
        file.path = path.resolve(base, rel);
        next(null, file);
    }))
    .pipe(htmlTransform({
        transformUrl,
        mode: 'xhtml'
    }))
    .pipe(dest());
});

gulp.task('assets', () => src(['./src/{img,demo}/**']).pipe(dest()));

gulp.task('watch', ['build'], () => {
    gulp.watch('./src/css/**/*.scss', ['style']);
    gulp.watch('./src/js/**/*.js', ['script']);
    gulp.watch('./src/*.html', ['html']);
    server(path.resolve(out), 8083);
});

gulp.task('full', ['build'], () => {
	return gulp.src('**/*.{html,css,js,ico,svg,map}', {cwd: out})
	.pipe(gzip({
		threshold: '1kb',
		gzipOptions: {level: 7}
	}))
	.pipe(dest());
});

gulp.task('resources', ['style', 'script', 'assets']);
gulp.task('build', ['resources', 'html']);
gulp.task('default', ['watch']);

function pass() {
	return through();
}

function through(transform, flush) {
    if (!transform) {
        transform = (obj, enc, next) => next(null, obj);
    }
    return new stream.Transform({
		transform,
        flush,
		objectMode: true
	});
}

function transformUrl(url, file, ctx) {
	return ctx.stats ? `/-/${ctx.stats.hash + url}` : url;
}
