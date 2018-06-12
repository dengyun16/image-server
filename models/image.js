/**
 * Created by admin on 2015/12/29.
 */

var mongoose = require('mongoose');

var schema = module.exports = new mongoose.Schema({
  referer: {type: String, required: false, unique: false, comment: 'Referer'},
  host   : {type: String, required: false, unique: false, comment: 'host'},
  ua     : {type: String, required: false, unique: false, comment: 'User-Agent'},
  hash   : {type: String, required: false, unique: false, comment: 'hash'},
  name   : {type: String, required: false, unique: false, comment: 'name'},
  size   : {type: Number, required: false, unique: false, comment: 'size'},
  mime   : {type: String, required: true, unique: false, comment: 'mime'},
  format : {type: String, required: true, unique: false, comment: 'format'},
  url    : {type: String, required: true, unique: false, comment: 'url'},
  root   : {type: String, required: true, unique: false, comment: 'root dir'},
  date   : {type: Date, required: true, unique: false, comment: 'createTime'}
});
