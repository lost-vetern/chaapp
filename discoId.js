var mongoose = require('mongoose');
var user = require('./user');
var uid = new mongoose.Schema({
    uid : {type : String, unique: true},
    username : {type:String,unique: true},
    password : String
});

module.exports = mongoose.model('discoId',uid);