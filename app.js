var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    session = require('express-session'),
    localStrategy = require ('passport-local'),
    user = require('./user'),
    discoId = require('./discoId'),
    server = require('http').createServer(),
    socket = require('socket.io'),
    io = socket(server);

var app = express();
//view 
app.set('view engine','ejs');
//body parsing
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
//express session
app.use(session({secret : 'topsecreat' , resave : false, saveUninitialized : false}));
//passport init and session
app.use(passport.initialize());
app.use(passport.session());
//strategies 
passport.use(new localStrategy(user.authenticate()));
//passport serialize and deserialize
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
//mongoose connection
mongoose.connect('mongodb://localhost:27017/chaapp');

//access control for reactnative 
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

var clients;

////////////sockets  
io.on('connection', (socket)=>{
    console.log('user connected'+socket.id);
    //disconnect
    socket.on('disconnect', function(){
        console.log('user disconnected');
      });

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
    user.register(new user({
        username: req.body.username,
        email: req.body.email
    }),req.body.password,function(err,user){
        if(err){
            console.log('sign up error');
            res.json({'error':err.message ? err.message : err.errmsg});
        }
        else{
        res.json({'user':user});
    }
    });
});

app.post('/signin',(req,res)=>{
    req.body.username
    user.find({username:req.body.username},function(err,dbres){
        if(err)res.json({'user':'u r fucked'});
        else {
            if(dbres.length==0)
            {
                user.create({username:req.body.username,number:req.body.number},function(err,dbres2){
                    if(err)res.json({'user':err});
                    else res.json({'user':dbres2});
                    return;
                });
            }
        }
        res.json({'user':dbres});
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

app.listen(2000,()=>{
    console.log('i am running');
});
