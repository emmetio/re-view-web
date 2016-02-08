'use strict';

const path = require('path');
const stream = require('stream');
const gulp = require('gulp');
const sass = require('gulp-sass');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const js = require('./gulp-tasks/js-bundle');
const notify = require('./gulp-tasks/notify');

const isWatching = ~process.argv.indexOf('watch');
const production = ~process.argv.indexOf('--production') || process.env.NODE_ENV === 'production';
const src = (pattern, options) => gulp.src(pattern, Object.assign({base: './src'}, options || {}));
const dest = (pattern) => gulp.dest(pattern || './out');

gulp.task('style', () => {
    return src('./src/css/*.scss')
    .pipe(sass()).on('error', notify('SCSS Error'))
    .pipe(production ? cssnano() : pass())
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

gulp.task('assets', () => src(['./src/index.html', './src/{img,demo}/**']).pipe(dest()));

gulp.task('watch', ['build'], () => {
    gulp.watch('./src/css/**/*.scss', ['style']);
    gulp.watch('./src/js/**/*.js', ['script']);
    gulp.watch('./src/*.html', ['assets']);
});

gulp.task('build', ['style', 'script', 'assets']);
gulp.task('default', ['build']);

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
