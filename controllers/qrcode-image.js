/*!
 * Created by admin on 2015/11/18.
 *
 * 如有任何问题，请联系<a href="duoyiim.pro://account=bGl1eWFuamllQGhlbmhhb2ppLmNvbQ==&amp;type=friend&amp;id=1315450771">网站程序-Web二组-刘艳杰[6017]<span class="ico_cc_sml" title="火星联系"></span></a>
 *
 * @author  liuyanjie@henhaoji.com
 *
 * @name 二维码图片接口
 * @secret
 * @module  二维码图片接口
 * @version 1.0.0
 */
'use strict';
const qrdecoder = require('node-zxing')({});

/**
 * 上传二维码并识别二维码信息
 *
 * @name /images/qrcode - POST
 * @method GET
 * @whocanuse
 *
 * @param req
 * @param {Array.<String>|String} req.query.images
 * @param res
 * @param next
 */
exports.decode = function (req, res, next) {
  qrdecoder.decode(path, function (err, out) {
      if (err) {
        return ccb(err);
      } else {
        //'D5WNlerEI7dcra7298Ad'
        if (!out) {
          return ccb('该图片不是个人微信二维码，请重新上传。');
        } else if (out.indexOf('http://weixin.qq.com/r/') === -1) {
          return ccb('该图片不是个人微信二维码，请重新上传。');
        } else {
          return ccb();
        }
      }
    }
  );
};

/**
 * 生成二维码
 *
 * @name /images/qrcode - GET
 * @method GET
 * @whocanuse
 *
 * @param req
 * @param {Array.<String>|String} req.query.texts -
 * @param res
 * @param next
 */
exports.encode = function (req, res, next) {

};
