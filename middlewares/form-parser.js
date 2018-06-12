/**
 * Created by Administrator on 2015/7/30.
 */
'use strict';
const formidable = require('formidable');

exports.parse = function (options) {
  return function parse(req, res, next) {
    const form = new formidable.IncomingForm(options);
    form.on('aborted', next);
    form.parse(req, function (err, fields, files) {
      if (err) {
        return next({name: 'internalError', msg: 'parse err:' + err});
      } else {
        req.formdata = {fields, files};
        return next();
      }
    });
  }
};
