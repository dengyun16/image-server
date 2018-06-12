/*!
 * Created by admin on 2015/11/18.
 *
 * 如有任何问题，请联系<a href="duoyiim.pro://account=bGl1eWFuamllQGhlbmhhb2ppLmNvbQ==&amp;type=friend&amp;id=1315450771">网站程序-Web二组-刘艳杰[6017]<span class="ico_cc_sml" title="火星联系"></span></a>
 *
 * @author  liuyanjie@henhaoji.com
 *
 * @name 下载远程图片
 * @secret
 * @module  下载远程图片
 * @version 1.0.0
 */
'use strict';
const Promise    = require('bluebird');
const fs         = require('fs-extra');
const path       = require('path');
const config     = require('config');
var childProcess = require('child_process');

const logger       = require('../tools/logger');
const imageService = require('../services/image');

/**
 * 下载远程图片
 *
 * @name /images/remote - GET
 * @method GET
 * @whocanuse
 *
 * @param req
 * @param {Array.<String>|String} req.query.urls    - 远程图片地址
 * @param res
 * @param next
 */
exports.remoteImage = function (req, res, next) {
  let vhostInfo = req.vhostInfo;
  let subDir    = (vhostInfo && vhostInfo.dir) ? vhostInfo.dir : config.upload.miscDir;
  let fileDir   = path.join(config.upload.rootDir, subDir, config.upload.imgUrlPath);

  let imageInfos = req.imageInfos;

  imageService.handleImage(req.headers, vhostInfo, imageInfos, fileDir).then((result)=> {
    next({status: 'success', msg: result.imageInfos});
  }).catch((err)=> {
    next({status: 'error', err: err});
  });
};
