/**
 * Created by admin on 2015/12/29.
 */
var config = require('config');
var mongoose = require('mongoose');

if (config.mongodb && config.mongodb.url) {
  var Image = mongoose.model('Image', require('./image'));

  mongoose.connect(config.mongodb.url);

  Image.getImgInfoAsync = function (vhostInfo, file) {
    return Image.findOne({host: vhostInfo.host, hash: file.hash});
  };

  exports.Image = Image;
}
else {
  exports.Image = {
    getImgInfoAsync: function () {
      return Promise.resolve(null);
    }
  };
}
