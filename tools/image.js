/**
 * Created by admin on 2015/11/20.
 */
var nodeUuid = require('node-uuid');
var Promise = require('bluebird');
var path    = require('path');
var gm      = require('gm');

Promise.promisifyAll(gm.prototype);

exports.crop = function crop(url, host, dir, w, h, x, y){
  var imgPathBefore     = url.replace(host, dir);
  var staticPathBefore  = url.replace(host, '');
  var imgFilenameBefore = path.basename(staticPathBefore);
  var imgDirnameBefore  = path.dirname(staticPathBefore);

  var imgFilenameAfter = nodeUuid.v1().replace(/-/gim, '') + path.extname(imgFilenameBefore);

  var staticPathAfter = path.join(imgDirnameBefore, imgFilenameAfter);

  var imgPathAfter = path.join(dir, staticPathAfter);

  var urlAfter = (host + staticPathAfter).replace(/\\/gim, '/');
  return gm(imgPathBefore).crop(w, h, x, y).autoOrient().writeAsync(imgPathAfter).return(urlAfter);
};

