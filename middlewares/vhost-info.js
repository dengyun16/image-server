/**
 * Created by admin on 2016/4/9.
 */
'use strict';
module.exports = function attachVhostInfo(vhostInfo) {
  return function (req, res, next) {
    req.vhostInfo = vhostInfo;
    next();
  }
};

