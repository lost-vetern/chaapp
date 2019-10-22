var mongoose = require('mongoose');
var user = require('./user');
var uid = new mongoose.Schema({
    uid : {type : String, unique: true},
    username : {
        type:String,
        ref : "user"
    }
});

module.exports = mongoose.model('discoId',uid);