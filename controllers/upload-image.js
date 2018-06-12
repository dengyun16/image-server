/*!
 * Created by admin on 2015/11/18.
 *
 * 如有任何问题，请联系<a href="duoyiim.pro://account=bGl1eWFuamllQGhlbmhhb2ppLmNvbQ==&amp;type=friend&amp;id=1315450771">网站程序-Web二组-刘艳杰[6017]<span class="ico_cc_sml" title="火星联系"></span></a>
 *
 * @author  liuyanjie@henhaoji.com
 *
 * @name 图片上传接口
 * @secret
 * @module  图片上传接口
 * @version 1.0.0
 */
'use strict';
const Promise    = require('bluebird');
const fs         = require('fs-extra');
const path       = require('path');
const config     = require('config');

const logger       = require('../tools/logger');
const imageService = require('../services/image');

/**
 * ### 图片文件上传接口
 *
 * 图片文件使用md5标识，所以可以避免文件重复问题，但是也带来新的问题，
 * 同一个文件会被多次引用，所以需要更谨慎的管理图片文件，避免文件丢失。
 *
 * 上传form说明：
 *  用一个隐藏的input把上传图片时使用的name告诉服务端，服务端用来索引上传的文件。
 *  如：<input type="text" name="imageInputName" value="image1,image2" hidden/>
 *  注意：客户端上传的图片的顺序由 value 中的名称决定。返回的url顺序和name1、name2保持一致。
 *
 *  如果没有input[name=imageInputName]，则默认为input[name=image]，只上传一个文件
 *
 * ```html
 * <form action="http://127.0.0.1:9000/images" method="POST" enctype="multipart/form-data">
 *    <h3 class="title">上传测试</h3>
 *    <table>
 *      <tr>
 *        <td><input type="file" name="image1"/></td>
 *        <td><input type="file" name="image2"/></td>
 *        <td><input type="text" name="imageInputName" value="image1,image2" hidden/></td>
 *        <td><input type="submit" ID="btn_Imports"  value="上传"/></td>
 *      </tr>
 *    </table>
 * </form>
 * ```
 *
 * ```json
 * {
 *    RetSucceed: true,
 *    Succeed: true,
 *    Code: 0,
 *    Desc: "成功",
 *    Message: [
 *        {
 *            name: "Chrysanthemum.jpg",
 *            date: "2016-01-29T02:55:44.890Z",
 *            hash: "076e3caed758a1c18c91a0e9cae3368f",
 *            size: 879394,
 *            format: "JPEG",
 *            mime: "image/jpeg",
 *            url: "http://10.17.64.58:19999/images/11/b1/11b1273c4f64462ed7aade496609a7df-879394-1024x768.jpg"
 *        },
 *        {
 *            name: "130407.jpg",
 *            date: "2016-01-29T02:55:44.890Z",
 *            hash: "a3fe01d5dd7efca70bdf565366df9900",
 *            size: 934050,
 *            format: "GIF",
 *            mime: "image/gif",
 *            url: "http://10.17.64.58:19999/images/31/3f/313fc0a7d7981897b05a0562b07d9f17-934050-296x296.gif"
 *        }
 *    ],
 *    extData: {
 *        imageInputName: "image1,image2"
 *    }
 * }
 * ```
 *
 * @name /images - POST
 * @method POST
 * @login false
 * @whocanuse
 *
 * @login false
 * @param req
 * @param res
 * @param next
 */
exports.uploadImgFile = function (req, res, next) {
  //let vhost = req.vhost;
  let vhostInfo = req.vhostInfo;
  let subDir    = (vhostInfo && vhostInfo.dir) ? vhostInfo.dir : config.upload.miscDir;
  let fileDir   = path.join(config.upload.rootDir, subDir, config.upload.imgUrlPath);

  let fields = req.formdata.fields;
  let files  = req.formdata.files;

  imageService.handleFormImage(req.headers, vhostInfo, fields, files, fileDir).then((result)=> {
    next({status: 'success', msg: result.imageInfos, ext: result.fields});
  }).catch((err)=> {
    next({status: 'error', err: err});
  });
};

/**
 * base64格式的图片字符串上传接口
 *
 * 上传数据格式
 * ```js
 * req.body = {
 *   images: [{
 *     name        : 'image1',
 *     base64String: base64String1
 *   },{
 *     name        : 'image2',
 *     base64String: base64String2
 *   }]
 * }
 * ```
 *
 * 返回数据格式
 * ```js
 * [ {
 *      name: 'image1',
 *      date: '2016-03-23T13:09:11.226Z',
 *      hash: '87ada0c2a066302207be2b4717f7514a',
 *      format: 'PNG',
 *      size: 1148,
 *      mime: 'image/png',
 *      url: 'http://127.0.0.1:19999/images/87/ad/87ada0c2a066302207be2b4717f7514a.png'
 *    }, {
 *      name: 'image2',
 *      date: '2016-03-23T13:09:11.226Z',
 *      hash: '076e3caed758a1c18c91a0e9cae3368f',
 *      format: 'JPEG',
 *      size: 879394,
 *      mime: 'image/jpeg',
 *      url: 'http://127.0.0.1:19999/images/07/6e/076e3caed758a1c18c91a0e9cae3368f.jpeg'
 *    }
 *  ]
 * ```
 * @name /images/base64 - POST
 * @method POST
 * @whocanuse
 *
 * @param req
 * @param {Array.<Object>} req.body.images                - 上传的图片信息数组
 * @param {Array.<Object>} [req.body.images[].name]       - 图片名字
 * @param {Array.<Object>} req.body.images[].base64String - 图片base64编码字符串
 * @param res
 * @param next
 */
exports.uploadBase64String = function (req, res, next) {
  //let vhost = req.vhost;
  let vhostInfo = req.vhostInfo;
  let subDir    = (vhostInfo && vhostInfo.dir) ? vhostInfo.dir : config.upload.miscDir;
  let fileDir   = path.join(config.upload.rootDir, subDir, config.upload.imgUrlPath);

  let imageInfos = req.imageInfos;

  imageService.handleImage(req.headers, vhostInfo, imageInfos, fileDir).then((result)=> {
    next({status: 'success', msg: result.imageInfos});
  }).catch((err)=> {
    next({status: 'error', err: err});
  });
};
