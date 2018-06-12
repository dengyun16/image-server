/**
 * Created by Administrator on 2015/9/14.
 */
var util    = require('util');
var path    = require('path');
var lodash  = require('lodash');
var fse     = require('fs-extra');
var request = require('request');

var pkg = require('../package.json');

var preTmpl = '<pre class="CodeContainer"><span>%s</span></pre>';

/**
 *
 * @param document
 * @returns {{}}
 */
function parseComponentInfo(document) {
	var documentHeader = lodash.find(document, {ctx: false});
	var component = {};

	[
		{label: 'name', filed: 'name'},
		{label: 'author', filed: 'author'},
		{label: 'secret', filed: 'secrit'},
		{label: 'description', filed: 'htmlstr'},
		{label: 'module', filed: 'module'}
	].forEach(function (item) {
			var field = lodash.find(documentHeader.tags, {type: item.label});
			if (field) {
				component[item.filed] = field.string;
			}
		});

	component['htmlstr'] = util.format(preTmpl, documentHeader.description.body);

	component.func = [];
	lodash.filter(document, {ctx: {}}).forEach(function (func) {
		var funcInfo = {};
		[
			{label: 'name', filed: 'name'},
			{label: 'method', filed: 'request_method'},
			{label: 'login', filed: 'need_login'},
			{label: 'whocanuse', filed: 'wo_can_use'},
			{label: 'param', filed: 'requestparameter'},
			{label: 'returns', filed: 'resultfiledexplain'}
		].forEach(function (item) {
				switch (item.label) {
					case 'param':
						//case 'return':
						var itemsInfo = lodash.filter(func.tags, {type: item.label});
						if (itemsInfo) {
							itemsInfo.forEach(function (itemInfo, i) {
								switch (itemInfo.name) {
									case 'req':
									case 'res':
									case 'next':
										itemsInfo[i] = {};
										break;
									default:
										itemsInfo[i] = {
											name     : itemInfo.name,
											type     : itemInfo.types.join('|'),
											is_need  : itemInfo.optional ? '否' : '是',
											range    : itemInfo.range,
											introduce: itemInfo.description.replace(/<[\w\/\s]+?>/g, '').replace(/\n/g, '')
										};
										break;
								}
							});
						}

						funcInfo[item.filed] = itemsInfo;
						break;

					default:
						var itemInfo = lodash.find(func.tags, {type: item.label});
						if (itemInfo) {
							funcInfo[item.filed] = itemInfo.string;
						}
				}
			});

		funcInfo.explain = func.description.summary.replace(/<[\w\/\s]+?>/g, '');

		if (func.description.body) {
			funcInfo.return_result = util.format(preTmpl, func.description.body);
		}
		component.func.push(funcInfo);
	});
	return component;
}

function component(doxpath, options) {
	var components = [];
	fse.readdirSync(doxpath).forEach(function (file){
		components.push(parseComponentInfo(fse.readJsonSync(path.join(doxpath, file))));
	});
	//console.log(util.inspect(components, {depth: null}));
	return components;
}

//var url = 'http://testwebapi.duoyioa.com:8011/send/documents';
var url = 'http://webapi.oa.com/send/documents';
exports.upload = function (path, callback) {
	request.post(url, {
		json: {documents: JSON.stringify({
			id      : pkg.webapi.id,
			passport: pkg.webapi.passport,
			content : component(path)
		})}
	}, function (err, resp, body) {
		if (err) {
			throw err;
		}
		else if (body.code !== 0) {
			throw new Error(body.msg);
		}
		callback();
	});
};
