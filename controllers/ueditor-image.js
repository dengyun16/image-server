/*!
 * Created by admin on 2015/11/18.
 *
 * 如有任何问题，请联系<a href="duoyiim.pro://account=bGl1eWFuamllQGhlbmhhb2ppLmNvbQ==&amp;type=friend&amp;id=1315450771">网站程序-Web二组-刘艳杰[6017]<span class="ico_cc_sml" title="火星联系"></span></a>
 *
 * @author  liuyanjie@henhaoji.com
 *
 * @name 百度编辑器图片处理接口
 * @secret
 * @module  百度编辑器图片处理接口
 * @version 1.0.0
 */
'use strict';
const Promise = require('bluebird');
const path = require('path');
const async = require('async');
const request = require('request');
const uuid = require('node-uuid');
const config = require('config');

const imageService = require('../services/image');

Promise.promisifyAll(request);

const userAgent = '' +
  'Mozilla/5.0 (Windows NT 6.1; WOW64) ' +
  'AppleWebKit/537.36 (KHTML,  like Gecko) ' +
  'Chrome/39.0.2171.95 Safari/537.36';

/**
 * ### 百度编辑器上传图片处理
 *
 * @name /images/ueditor/local POST
 * @method GET
 * @login false
 * @whocanuse
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.localImage = function remoteImage(req, res, next) {
  //let vhost = req.vhost;
  let vhostInfo = req.vhostInfo;
  let subDir    = (vhostInfo && vhostInfo.dir) ? vhostInfo.dir : config.upload.miscDir;
  let fileDir   = path.join(config.upload.rootDir, subDir, config.upload.imgUrlPath);

  let fields = req.formdata.fields;
  let files  = req.formdata.files;
  files.image = files.upfile;
  imageService.handleFormImage(req.headers, vhostInfo, fields, files, fileDir).then((result)=> {
    let imageInfo = result.imageInfos[0];
    console.log({state: 'SUCCESS', url: imageInfo.url, title: '', original: ''});
    return res.json({state: 'SUCCESS', url: imageInfo.url, title: '', original: ''});
  }).catch((err)=> {
    console.error(err);
    return res.json({url: '', title: '', original: '', state: 'FAILED'});
  });
};

/**
 * ### 远程图片处理
 *
 * 处理百度编辑器远程图片 利用async改写后
 * 根据新版百度编辑器的协议，修改返回值格式为：
 * imgs    图片url数组
 * list: [
 *    {
 *      url: '/path/to/img.jpg',
 *      source: 'source_img_name',
 *      state: 'SUCCESS'
 *    }
 * ]
 *
 * @name /images/ueditor/remote - POST
 * @method GET
 * @login false
 * @whocanuse
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.remoteImage = function remoteImage(req, res, next) {
  /**
   * 处理百度编辑器远程图片 利用async改写后
   * 根据新版百度编辑器的协议，修改返回值格式为：
   * imgs    图片url数组
   * list: [
   *    {
   *      url: '/path/to/img.jpg',
   *      source: 'source_img_name',
   *      state: 'SUCCESS'
   *    }
   * ]
   */
  function remoteimg(req, res, cb) {
    var paths = [], imgs = req.body['source[]'] || req.body['source'] || [];
    if (!(imgs instanceof Array)) {
      imgs = [imgs];
    }
    return Promise.each(imgs, function () {
      var imgReg = /http:\/\/[^'"]*(\.jpg|\.jpeg|\.png|\.gif|.bmp|.svg|.ico)/gim;
      var imgRegExec = imgReg.exec(img);

      if (imgRegExec.length < 2) {
        return ccb();
      }

      var filename = uuid.v1().replace(/-/g, '');
      var file = filename + imgRegExec[1];
      var baseDir = req.options.baseDir || config.filePath;
      var savePath = req.options.savePath || '/';
      var saveurl = '/' + savePath + '/' + file;

      //磁盘文件名路径
      var filepath = path.join(baseDir, savePath, file);
      paths.push(saveurl);
      //根据图片url保存到本地

      return new Promise((resolve, reject) => {
        request.get({
          url    : img,
          headers: {'User-Agent': userAgent}
        }, (err) => {
          if (err) {
            reject(err);
          }
          else {
            resolve();
          }
        }).pipe(fs.createWriteStream(filepath));
      });

    }).catch(function (err) {
      if (err) {
        logger.error('remoteimg error: ', err);
      }
    }).finally(() => {
      var list = [];
      for (var i = 0; i < url.length; ++i) {
        list.push({url: config.staticFileServer + url[i], source: imgs[i], state: 'SUCCESS'});
      }
      return cb(null, {list: list, url: url, srcUrl: imgs});
    });
  }
};
