/**
 * Created by admin on 2015/4/15.
 *
 * @author  liuyanjie@henhaoji.com
 *
 * @module  example
 */
'use strict';
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');
var gulp = require('gulp');
var gulpUtil = require('gulp-util');
var gulpRename = require('gulp-rename');

global.ROOT_PATH = __dirname;
var utils = require('./utils');

var jshint = require('gulp-jshint');
gulp.task('gulp-jshint', function () {
	return gulp
		.src([
			'cache/**/*.js',
			'config/**/*.js',
			'controllers/**/*.js',
			'lib/**/*.js',
			'middlewares/**/*.js',
			'models/**/*.js',
			'plugins/**/*.js',
			'proxy/**/*.js',
			'routes/**/*.js',
			'servers/**/*.js',
			'services/**/*.js',
			'test/**/*.js',
			'tools/**/*.js',
			'utils/**/*.js'
		])
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish'));
});

//var gulpJsdoc2md = require('gulp-jsdoc-to-markdown');
//gulp.task('gulp-jsdoc-to-markdown', function () {
//	return gulp.src('example/jsdoc/*.js')
//		.pipe(gulpJsdoc2md({
//			template           : fs.readFileSync('./doc/doc.hbs', 'utf8'),
//			'heading-depth'    : 0,
//			'param-list-format': 'table'
//		}))
//		.on('error', function (err) {
//			gulpUtil.log(gulpUtil.colors.red('jsdoc2md failed'), err.message)
//		})
//		.pipe(gulpRename(function (path) {
//			path.extname = '.md';
//		}))
//		.pipe(gulp.dest('doc/example/jsdoc'));
//});

var jscs = require('gulp-jscs');
gulp.task('gulp-jscs', function () {
	return gulp.src('controllers/*.js').pipe(jscs());
});

var mocha = require('gulp-mocha');
gulp.task('gulp-mocha', function () {
	return gulp.src(['test/**/*.test.js'], {read: false}).pipe(mocha({reporter: 'nyan'}));
});

var dox = require('gulp-dox');
gulp.task('gulp-dox', function () {
	gulp.src('./controllers/*.js').pipe(dox({})).pipe(gulp.dest('./doc/webapi'));
});

var webapi = require('./tools/webapi');
gulp.task('gulp-webapi', ['gulp-dox'], function () {
	setTimeout(function () {
		var webapiDir = path.join(__dirname, 'doc/webapi');
		webapi.upload(webapiDir, function () {
			fse.remove(webapiDir);
		});
	}, 3000);
});
