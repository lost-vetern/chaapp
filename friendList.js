var mongoose = require('mongoose');
var uidSchema = require('./user');

var friendList = new mongoose.Schema({
    id:{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'discoId'
    },
    list:[{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'discoId'
    }]   
});

module.exports = mongoose.model('friendList',friendList);