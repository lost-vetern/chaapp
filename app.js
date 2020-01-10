var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    user = require('./user'),
    server = require('http').createServer(),
    socket = require('socket.io'),
    io = socket(server);

var app = express();
//view 
app.set('view engine','ejs');
//body parsing
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//mongoose connection
mongoose.connect('mongodb://localhost:27017/chaapp');

//access control for reactnative 
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

var clients;

////////////sockets  
io.on('connection', (socket)=>{
    console.log('user connected'+socket.id);
    //disconnect
    socket.on('disconnect', function(){
        delete clients[socket.nickname];
        console.log('user disconnected');
      });
      ///add user
      socket.on('add-user', function(data){
            socket.nickname = data.username;
            clients[data.username]=socket.id;
            console.log(clients[data.username]);
        });
    /*
    {from, to, msg}
    */ 
    socket.on('msg',function(data){
        io.to(clients[data.to]).emit('msgfromserver',data);
    });
});

app.get('/fail',(req,res)=>{
    res.json({'user':'0'});
});

app.post('/signup',(req,res)=>{
    //existing
    user.find({authId:req.body.authId},function(err,dbres){
        if(err)res.json({status:0,res:err});
        else if (dbres.length==0){
            //create new
            user.create({
                chaappId:req.body.chaappId,
                email:req.body.email,
                authId:req.body.authId,
                imageUrl: req.body.imageUrl,
                active:true
            },function(err,dbres2){
                if(err)res.json({status:0 , res:err});
                else res.json({status: 1, res:dbres2});
            });
        }
        //return existing
        else {
            res.json({status: 1, res:dbres[0]});
        }
    });
    
});

///change chaappId
app.post('/changeId',(req,res)=>{
    user.updateOne({authId:req.body.authId},{$set:{chaappId:req.body.chaappId}},
        function(err,dbres){
        if(err)res.json({status:0,res:err});
        else res.json({status:1,res:dbres});
    });
});

app.get('/check',(req,res)=>{
    console.log(Math.random(2));
});

app.post('/checkName',(req,res)=>{
    user.find({username:req.body.username},function(err,dbres){
        if(err)res.json({'status':0});
        else{
            if(dbres.length==0){res.json({'status':1});}
            else res.json({'status':0});
        }
    });
});

app.listen(2222,()=>{
    console.log('i am running');
});
