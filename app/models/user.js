var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  salt: 'taco',
  //hypothetical hashedpassword generator
  //with salt
  hashPassword: function(req) {
    var currentPassword = req.body.password;
    var hashedPassword = bcrypt.hashSync(currentPassword, this.salt)
  }

});

module.exports = User;
