'use strict';
var util = require('util');

/**
 * Base64加密邮箱帐号
 */
var toBase64 = function (str) {
  return new Buffer(str.toString()).toString('Base64');
};

/**
 * 用于将邮箱转换为imid
 */
var bkdrHash = function (str) {
  str = str.toString();
  if (str) {
    var seed = 131;
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = (hash * seed) + str.charCodeAt(i);
      hash &= 0x7FFFFFFF;
    }
    return hash;
  }
};

var aTagTpl = '<a class="callHuoxingDialog" href="duoyiim.pro://type=friend&id=%d&account=">%s<span class="ico_cc_sml" title="%s"></span></a>';

function callHuoxingDialogUrl(henhaoji, text, title) {
  return util.format(aTagTpl, bkdrHash(henhaoji), text, title);
}

var html = callHuoxingDialogUrl('liuyanjie@henhaoji.com', '网站程序-Web二组-刘艳杰[6017]', '火星联系');

console.log(bkdrHash('liuyanjie@henhaoji.com'));
console.log(toBase64('liuyanjie@henhaoji.com'));
