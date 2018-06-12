/**
 * Created by Administrator on 2015/7/30.
 *
 * @author  liuyanjie@henhaoji.com
 *
 * @module  middlewares/not-found
 */
'use strict';
module.exports = function (options) {

	/**
	 * pageNotFound middleware
	 * @param {http.Request}    	req
	 * @param {http.Response}    	res
	 * @param {Function}  				next
	 */

	return function pageNotFound(req, res, next) {
		next({status: 'pageNotFound'});
	};
};
