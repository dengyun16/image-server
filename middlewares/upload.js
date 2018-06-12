var path = require('path');
var config = require('config');
var formidable = require('formidable');
var promise = require('bluebird');
var upload = require('../tools/upload');

exports.uploadImage = uploadImage;

function uploadImage(config) {
  return function uploadImage(req, res, next) {
    var form = new formidable.IncomingForm(config.formidableConf);
    form.parse(req, function (err, fields, files) {
      if (err) {
        return next(err);
      }

      if (!files['image']) {
        return next('找不到image');
      }

      var image = files['image'];

      var pathsplit = image.path.split(path.sep);

      var imageInfo = {};

      imageInfo.name       = image.name;
      imageInfo.saveAsName = pathsplit[pathsplit.length - 1];
      imageInfo.staticPath = path.join(config.upload.staticDir, imageInfo.saveAsName).replace(/\\/g, '/');
      imageInfo.size       = image.size;
      imageInfo.type       = image.type;
      imageInfo.ext        = path.extname(imageInfo.saveAsName);
      imageInfo.url = 'http://127.0.0.1:10011/' + imageInfo.staticPath;

      req.imageInfo = imageInfo;

      return next();
    });
    form.on('aborted', function () {
      return next('用户取消上传');
    });
  }
}
