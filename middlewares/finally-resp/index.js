/**
 * Created by Administrator on 2015/7/29.
 */
'use strict';
var fs     = require('fs');
var http   = require('http');
var path   = require('path');
var debug  = require('debug')('middlewares:finallyResp');
var mkdirp = require('mkdirp');

var utils        = require('../../utils');
var logger       = require('../../tools/logger');

var JSONString = 'JSONString';
var econding   = 'utf8';

/**
 * finallyResp
 * @param {Object}      options
 * @param {Object}      [options.format='JSONString']    	- 默认接口返回的数据格式 JSON|JSONString
 * @param {Object}      [options.econding='utf8']        	- 默认接口返回的数据编码
 * @param {Object}      options.views                  		- 默认模版，如views[500]='500.ejs'
 * @returns {Function}
 */

module.exports = function finallyResp(options) {
	options           = options || {};
	var defaultFormat = options.format || JSONString;

	var econding = options.econding || econding;

	var views = options.views;
  
    var STATUS = options.STATUS || require('./defines').STATUS;

	/**
	 * finallyResp - 统一返回处理逻辑
	 * @param {Object}            result            - 处理前的结果对象
	 * @param {String}            result.status     - 状态
	 * @param {*}                 result.msg        - 数据
	 * @param {*}                 result.ext        - 扩展
	 * @param {Error|String}      result.err        - 错误
	 * @param {Error|String}      result.reason     - status=failure时的拒绝原因
	 * @param {String}            result.desc       - 描述
	 * @param {String}            result.view       - 视图模版(渲染成功)
	 * @param {String}            result.errorView  - 视图模版(渲染出错)
	 * @param {String}            result.page       - 静态文件路径
	 *
	 * @param {http.Request}      req               - http.Request
	 * @param {String}            req.query.format  - 接口返回的数据格式
	 *
	 * @param {http.Response}     res               - http.Response
	 *
	 * @param {Function}          next              - app.next
	 *
	 * @description
	 *
	 * @returns {*}
	 */

	return function finallyResp(result, req, res, next) {

		if (isError(result)) {
			result = {
				status: 'error',
				err   : result
			};
		}
		else if (!result.status) {
			result = {
				status: 'success',
				msg   : result
			}
		}
		
		debug('finallyResp:', result);
		
		// 兼容next({status: 'error', err: err});
		// 当next({status: 'failure', reason: reason})时，reason可能是程序异常或只是操作失败
		// 为了方便处理，这里使用reason携带相关信息，
		// 如果reason是Error，即转换成error
		if (result.status === 'failure') {
			if (isError(result.reason)) {
				result.status = 'error';
				result.err = result.reason;
			}
			else {
				result.msg = result.reason;
			}
		}

		var final = STATUS[result.status];
		if (!final) {
			throw new Error('result.status undefined!');
		}

		var url = req.url;

		var msg = result.msg;
		var ext = result.ext || {};

		var view = result.view || views[final.statusCode] || final.view;
		var page = result.page;

		var err  = result.err;
		var desc = final.desc;

		res.status(final.statusCode);

		function dealError(statusCode, err) {
			res.status(statusCode);
			var errorView = result.errorView || views[statusCode];
			if (!errorView) {
				res.end(http.STATUS_CODES[statusCode]);
			}
			else {
				res.render(errorView, {msg: msg, err: err});
			}
		}

		function logAndDealError(url, statusCode, err) {
			logError(req, url, err);
			dealError(statusCode, err);
		}

		if (view) {
			if (err) {
				logAndDealError(url, 500, err);
			}
			else {
				res.render(view, msg, function (err, html) {
					if (err) {
						logAndDealError(url, 500, err);
					}
					else {
						if (page) {
							try {
								mkdirp.sync(path.dirname(page));
								fs.createWriteStream(page).write(html);
							} catch (err) {
								logError(req, url, err);
							}
						}
						res.send(html);
					}
				});
			}
		}
		else if (page) {
			try {
				res.sendFile(page);
			} catch (err) {
				logAndDealError(url, 404, err);
			}
		}
		else {
			if (err) {
				logError(req, url, err);
				if (utils._.isString(err)) {
					desc = err;
				}
			}
			var retObj = {
				RetSucceed: true,
				Succeed   : final.succeed,
				Code      : final.code,
				Desc      : desc,
				Message   : msg,
				extData   : ext
			};
			var format = result.format || req.query.format || defaultFormat;
			if (format === JSONString) {
				res.send(JSON.stringify(retObj));
			}
			else {
				res.json(retObj);
			}
		}
	};
};

function logError(req, url, err) {
	if (err instanceof Error || utils._.isError(err)) {
		logger.error('\nError begin', '\n', err, '\n', req.method, url, '\n', 'Error end');
	}
	else if (utils._.isString(err)) {
		logger.warn('\nWarn begin', '\n', err, '\n', req.method, url, '\n', 'Warn end');
	}
}

function isError(err) {
	return (err instanceof Error || utils._.isError(err));
}
