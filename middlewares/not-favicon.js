/**
 * Created by Administrator on 2015/7/30.
 */
'use strict';
module.exports = function() {
  return function(req, res, next) {
    if (/\/favicon\.?(jpe?g|png|ico|gif)?$/i.test(req.url)) {
      res.status(404).end();
    } else {
      next();
    }
  };
};
