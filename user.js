var mongoose = require('mongoose');

var user = new mongoose.Schema({
    chaappId : {type:String, unique:true},
    email : {type:String},
    authId : {type:String, unique:true},//We will send googleid or phone number here
    imageUrl : String,
   active : Boolean
});
module.exports = mongoose.model('user',user);