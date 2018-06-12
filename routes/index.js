'use strict';
const express = require('express');
const config  = require('config');

const accessImageCtrl  = require('../controllers/access-image');
const qrcodeImageCtrl  = require('../controllers/qrcode-image');
const remoteImageCtrl  = require('../controllers/remote-image');
const removeImageCtrl  = require('../controllers/remove-image');
const ueditorImageCtrl = require('../controllers/ueditor-image');
const uploadImageCtrl  = require('../controllers/upload-image');
const webpageImageCtrl = require('../controllers/webpage-image');

const attachVhostInfo = require('../middlewares/vhost-info');

const middlewares = require('../middlewares');
const formParser  = middlewares.formParser;
const base64image = middlewares.base64image;
const remoteImage  = middlewares.remoteImage;
const webpageImage = middlewares.webpageImage;

module.exports = function createRouter(vhostInfo) {

  let vhostRouter = express.Router().use(attachVhostInfo(vhostInfo));

  vhostRouter.post('/images', formParser.parse(config.formidableConf), uploadImageCtrl.uploadImgFile);
  vhostRouter.post('/images/base64', base64image.parse(config.upload), uploadImageCtrl.uploadBase64String);

  vhostRouter.get('/images/:xx/:yy/*', accessImageCtrl.accessImage);
  vhostRouter.get('/webpage/:xx/:yy/*', accessImageCtrl.accessImage);
  vhostRouter.get('/qrcode/:xx/:yy/*', accessImageCtrl.accessImage);
  vhostRouter.get('/remote/:xx/:yy/*', accessImageCtrl.accessImage);
  vhostRouter.delete('/images/:xx/:yy/*', removeImageCtrl.removeImage);

  vhostRouter.get('/images/remote', remoteImage(config.upload), remoteImageCtrl.remoteImage);

  vhostRouter.get('/images/webpage', webpageImage.parse(config.upload), webpageImageCtrl.webpageImage);

  vhostRouter.post('/images/ueditor/local', formParser.parse(config.formidableConf), ueditorImageCtrl.localImage);
  vhostRouter.post('/images/ueditor/remote', ueditorImageCtrl.remoteImage);

  vhostRouter.get('/images/qrcode', qrcodeImageCtrl.encode);
  vhostRouter.post('/images/qrcode', qrcodeImageCtrl.decode);
  return vhostRouter;
};
