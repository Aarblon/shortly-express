var request = require('request');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

exports.getUrlTitle = function(url, cb) {
  request(url, function(err, res, html) {
    if (err) {
      console.log('Error reading url heading: ', err);
      return cb(err);
    } else {
      var tag = /<title>(.*)<\/title>/;
      var match = html.match(tag);
      var title = match ? match[1] : url;
      return cb(err, title);
    }
  });
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;

exports.isValidUrl = function(url) {
  return url.match(rValidUrl);
};


/************************************************************/
// Add additional utility functions below
/************************************************************/
exports.checkUser = function(req, res) {
  //could work on boolean value
  if(req.body.sessionID === undefined) {
    return false;
  } else {
    return true;
  }
};

exports.hashPassword = function(password) {
  //eventually refactor to async
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}
;
exports.sessionHasher = function(user) {
  //upon some request generate a unique id
  console.log('Initializing the session hasher');
  console.log('************************************************');
  var session = user.attributes.username + Date.now();
  console.log('our session variable', session);
  var shasum = crypto.createHash('sha1');
  console.log('Initializing shasum: ', shasum);
  shasum.update(session);
  console.log('Updated shasum: ', shasum);
  var result = shasum.digest('hex');
  console.log('result: ', result);
  return result;
};
