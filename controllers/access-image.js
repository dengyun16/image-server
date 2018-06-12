/*!
 * Created by admin on 2015/11/18.
 *
 * 如有任何问题，请联系<a href="duoyiim.pro://account=bGl1eWFuamllQGhlbmhhb2ppLmNvbQ==&amp;type=friend&amp;id=1315450771">网站程序-Web二组-刘艳杰[6017]<span class="ico_cc_sml" title="火星联系"></span></a>
 *
 * @author  liuyanjie@henhaoji.com
 *
 * @name 图片访问接口
 * @secret
 * @module  图片访问接口
 * @version 1.0.0
 */

'use strict';
const Promise    = require('bluebird');
const lodash     = require('lodash');
const fs         = require('fs-extra');
const path       = require('path');
const gm         = require('gm');
const config     = require('config');

const logger       = require('../tools/logger');
const imageService = require('../services/image');

const imgReg  = /(?:[_.](\d{2,4})x(\d{2,4})(?:Q(\d{1,3}))?\.(?:jpg|jpeg|png|webp))$/;
const gifReg  = /(?:.gif)(\[0]\.(?:jpg|jpeg|png|webp))?$/;
const cropReg = /_crop_((_?\d{1,4}(?:\.\d)?){4})\.(?:jpg|jpeg|png|webp)$/;

Promise.promisifyAll(gm.prototype);

/**
 * ### 图片访问接口
 *
 * 生成的图片后缀可以是：.jpg .jpeg .png .webp
 *
 * 图片路径格式：
 *
 * 约定：原图的路径中不使用下划线 \_ ，使用 - 分隔不同信息。
 * 附加信息使用 \_ 分割，如 _120x120Q100 ，或者是query参数（还未支持），如?w=120&h=120&q=100。
 *
 * 切图：http://www.images.com/images/a1/04/a104fcfd7dc738dbed6f4a175612e508.jpg_96x96.jpg
 * 切图：http://www.images.com/images/a1/04/a104fcfd7dc738dbed6f4a175612e508.jpg_120x120.jpg
 * 切图：http://www.images.com/images/a1/04/a104fcfd7dc738dbed6f4a175612e508.jpg_120x120Q0.jpg
 * 切图：http://www.images.com/images/a1/04/a104fcfd7dc738dbed6f4a175612e508.jpg_120x120Q100.jpg
 * 切图：http://www.images.com/images/a1/04/a104fcfd7dc738dbed6f4a175612e508-879394-1024x768.jpg_120x120Q100.jpg
 *
 * 如果文件路径中包含大小和尺寸信息，后缀添加方式无变化。
 *
 * 由于旧的文件路径中不包含大小和尺寸信息，客户端又需要使用大小和尺寸信息，需要对旧的路径进行兼容。
 *
 * Q[0-100] 表示图片质量
 *
 * 图片尺寸: 64x64 72x72 80x80 96x96 108x108 128x128 160x160 240x240
 *            256x256 320x320 350x350 450x450 480x480 640x640 1242x1242
 *
 * gif格式图片处理  NOTE：前端需要对后缀进行判断，服务端需保证图片后缀名无误。
 *
 * 原图：http://127.0.0.1:19999/images/43/fe/43fe0a9a841deb9ff84b2b666fc28d5d.gif
 * 首帧：http://127.0.0.1:19999/images/43/fe/43fe0a9a841deb9ff84b2b666fc28d5d.gif[0].jpg
 *
 * 图片裁剪：
 *
 * 原图：http://www.images.com/images/a1/04/a104fcfd7dc738dbed6f4a175612e508.jpg
 * 切图：http://www.images.com/images/a1/04/a104fcfd7dc738dbed6f4a175612e508.jpg_crop_x_y_w_h.jpg
 * 切图：http://www.images.com/images/a1/04/a104fcfd7dc738dbed6f4a175612e508.jpg_crop_200_200_1000_1000.jpg
 * 切图：http://www.images.com/images/a1/04/a104fcfd7dc738dbed6f4a175612e508.jpg_crop_200.1_200.1_1000.4_1000.5.jpg
 *
 * @name /images - GET
 * @method GET
 * @login false
 * @whocanuse
 *
 * @param req
 * @param res
 * @returns {*}
 */
exports.accessImage = function (req, res) {
  //var vhost = req.vhost;
  let url       = decodeURIComponent(req.url);
  let vhostInfo = req.vhostInfo;
  let subDir    = (vhostInfo && vhostInfo.dir) ? vhostInfo.dir : config.upload.miscDir;
  let fileDir   = path.join(config.upload.rootDir, subDir);

  let pathName = path.join(fileDir, url);

  logger.info('accessImage fileDir', fileDir);
  logger.info('accessImage subDir', subDir);
  logger.info('accessImage pathname', pathName);

  function sendFile(filepath) {
    res.header('Cache-Control', 'public, max-age=3153600');
    return res.sendFile(filepath, {root: '/'})
  }

  // 处理gif图片，根据url判断返回第一帧还是返回原图
  let gifMatch = pathName.match(gifReg);
  if (gifMatch) {
    if (gifMatch[1]) {
      let thumbnail0 = path.join(fileDir, url.replace('images', 'thumbnail'));

      // 第一帧存在直接返回
      if (fs.existsSync(thumbnail0)) {
        return sendFile(thumbnail0, {root: '/'});
      }

      let oriFilePath = pathName.replace(gifMatch[1], '');
      if (fs.existsSync(oriFilePath)) {
        let pathName0 = oriFilePath + '[0]';
        fs.mkdirsSync(path.dirname(thumbnail0));
        return gm(pathName0).writeAsync(thumbnail0).then(function () {
          return sendFile(thumbnail0, {root: '/'});
        }).catch(function (err) {
          logger.error(err);
          res.status(404);
          return res.end();
        });
      }
      else {
        //logger.warn('原图不存在');
        res.status(404);
        return res.end();
      }
    }
    else {
      if (fs.existsSync(pathName)) {
        return sendFile(pathName, {root: '/'});
      }
      else {
        //logger.warn('原图不存在');
        res.status(404);
        return res.end();
      }
    }
  }

  // 裁剪图片
  let cropRegMatch = pathName.match(cropReg);
  if (cropRegMatch) {
    let cropImgFile = path.join(fileDir, url.replace('images', 'crops'));

    if (fs.existsSync(cropImgFile)) {
      return sendFile(cropImgFile, {root: '/'});
    }

    let originImgUrl = pathName.replace(cropRegMatch[0], '');
    if (fs.existsSync(originImgUrl)) {
      let xywh = cropRegMatch[1].split('_');

      let crop_x = xywh[0];
      let crop_y = xywh[1];
      let crop_w = xywh[2];
      let crop_h = xywh[3];

      fs.mkdirsSync(path.dirname(cropImgFile));
      return gm(originImgUrl).crop(crop_w, crop_h, crop_x, crop_y).writeAsync(cropImgFile)
        .then(function () {
          return sendFile(cropImgFile, {root: '/'});
        })
        .catch(function (err) {
          logger.error(err);
          return sendFile(originUrl, {root: '/'});
        });
    } else {
      //logger.warn('原图不存在');
      res.status(404);
      return res.end();
    }
  }

  // 缩略图
  let strMatch = pathName.match(imgReg);

  if (!strMatch) {
    if (fs.existsSync(pathName)) {
      return sendFile(pathName, {root: '/'});
    }
    else {
      res.status(404);
      return res.end();
    }
  }

  let thumbnail = path.join(fileDir, url.replace('images', 'thumbnail'));

  // 缩略图存在直接返回
  if (fs.existsSync(thumbnail)) {
    return sendFile(thumbnail, {root: '/'});
  }

  let x = strMatch[1];
  let y = strMatch[2];
  let q = strMatch[3] || 100;

  if (config.imgSizes && !config.imgSizes[x + 'x' + y]) {
    res.status(404);
    return res.end();
  }

  let originUrl = pathName.replace(strMatch[0], '');

  if (fs.existsSync(originUrl)) {
    return gm(originUrl).sizeAsync().then(function (image) {
      let wOri = image.width, hOri = image.height, w = wOri, h = hOri;
      if (wOri >= hOri && hOri > x) {
        w = parseInt(x * wOri / hOri);
        h = x;
      } else if (wOri < hOri && wOri > x) {
        w = x;
        h = parseInt(x * hOri / wOri);
      }

      fs.mkdirsSync(path.dirname(thumbnail));

      return gm(originUrl).thumbAsync(w, h, thumbnail, q).then(function () {
        return sendFile(thumbnail, {root: '/'});
      });
    }).catch(function (err) {
      logger.error(err);
      return sendFile(originUrl, {root: '/'});
    });
  } else {
    //logger.warn('原图不存在');
    res.status(404);
    return res.end();
  }
};

