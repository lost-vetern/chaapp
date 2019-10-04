var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    session = require('express-session'),
    localStrategy = require ('passport-local'),
    user = require('./user'),
    discoId = require('./uidSchema'),
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
    res.json({msg:':('});
});



app.post('/signup',(req,res)=>{
    user.register(new user({
        username: req.body.username,
        email: req.body.email,
    }),req.body.password,function(err,user){
        if(err){
            console.log('sign up error');
            res.json({'error':err.message ? err.message : err.errmsg});
        }
        else{
        //res.json({'user':user});
        console.log('i m in else');
        discoId.create({uid:req.body.uid, username : req.body.username},function(err,dbres){
            if(err){res.json({'error':err.errmsg?err.errmsg:err.message});}
            else res.json({'user':dbres});
        });
    }
    });
});

app.post('/signin',passport.authenticate('local'),(req,res)=>{
    discoId.findOne({username:req.user.username},function(err,dbres){
        if(err)res.json({'user':err});
        else {
        res.json({'user':dbres});
    }
    });
    //res.json({'user':req.user.username});
});

app.get('/allnames',(req,res)=>{
    discoId.find({},function(err,dbres){
        if(err){res.json({'status':'0'})}
        else{res.json({'users':dbres});}
    });
});


app.get('/',(req,res)=>{
    console.log('hiii');
    res.send('hi');
});

app.listen(2000,()=>{
    console.log('i am running');
});
