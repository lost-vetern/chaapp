var mongoose = require('mongoose');
var passportlocal = require('passport-local-mongoose');
var user = new mongoose.Schema({
    username : {type:String, unique:true},
    email : {type:String, unique:true},
    password : String
});

user.plugin(passportlocal);
module.exports = mongoose.model('user',user);