var express = require('express');
var app = express();
app.use(express.static("views"));
app.listen(process.env.PORT || '3007');


const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:admin@cluster0.k2oht.mongodb.net/tinder', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected");
});

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
// Định nghĩa 1 collection thông qua Schema
var user = new mongoose.Schema({
  name:String,
  address : String,
  DateOfBird : String,
  gioiTinh : String,
  soThich : String,
  phone : String,
  password : String,
  avatar : String

});
// user trước là tên của collection , nếu trên db ko có thì chương trình tạo 1 collection





var expressHbs = require('express-handlebars');

app.engine('handlebars',expressHbs({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  layoutsDir: __dirname + '/views/layouts',
  defaultLayout: 'main'
}));
app.set('view engine','handlebars');

app.get('/',function (request,response) {
  var connectUsers = db.model('users', user);
  connectUsers.find({},
      function (error, users) {
        if (error) {

        } else {

          response.render("main",{layout: 'listUser',users:users});
        }
      })
})

app.get('/addUser.handlebars',function (request,response) {





  response.render('main',{layout: 'addUser'});

})


app.get('/editUser.handlebars',function (request,response,) {

  response.render("main",{layout: 'editUser'});
})

let baseJson = {
  errorCode : undefined,
  errorMessage:undefined,
  data:undefined
}

app.get('/getUser',function (req,res) {
  const userConnect = db.model('users', user);

  userConnect.find({},
      function (error, user1) {
        if (error) {
          baseJson.errorCode = 400
          baseJson.errorMessage = error
          baseJson.data = []


        } else {
          baseJson.errorCode = 200
          baseJson.data = user1

          res.send(baseJson)
        }
      })

})




var multer  = require('multer')
var path = require('path');
app.use(express.static(__dirname));
var storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, './public/data/uploads/')
  },
  filename: function (req,file,cb){

    const uniqueSuffix = Date.now() //+ '-' + Math.round(Math.random() * 1E9)

    cb(null, uniqueSuffix +path.extname(file.originalname));
  }


})
var upload = multer({
  storage: storage,
  limits:{
    fileSize:2*1024*1024, //gioi han file size <= 1MB
  },
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if(ext !== '.jpg' && ext !== '.zip'  ) {
      return callback(new Error('File chi co the la jpg'))
    }
    callback(null, true)
  },


});


//var upload1 = upload.single('avatar');
app.post('/profile',upload.single('avatar'), function (req, res) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log(req.file)
  //res.send("upload thanh cong");
  // upload(req,res,function (error){
  //
  //
  //     if(error instanceof multer.MulterError){
  //
  //         res.send(""+error)
  //     }else if(error){
  //
  //         res.send("file chi co the la jpg ")
  //     }
  //     else {



  var userInsert = db.model('users',user);

  userInsert({
    name: req.body.name,
    address : req.body.address,
    DateOfBird : req.body.date,
    gioiTinh : req.body.gioitinh,
    soThich : req.body.sothich,
    phone : req.body.phone,
    password : req.body.password,
    avatar : "./public/data/uploads/" + req.file.filename
  }).save(function (error){
    if(error){
      res.send("loi")
    }else {
      // res.send("Thanh Cong")
      userInsert.find({},
          function (error, users) {
            if (error) {

            } else {

              res.render("main",{layout: 'listUser',users:users});
            }
          })
    }

  });

  // }



  //});
})


app.post('/delete',upload.single('avatar'), function (req, res,) {
  var userDelete = db.model('users',user);
  console.log(req.body.id);
  userDelete.remove({_id : req.body.id},function (error) {
    if(error){
      res.send("Loi")
    }else {
      // res.send("Thanh Cong")

      userDelete.find({},
          function (error, users) {
            if (error) {

            } else {

              res.render("main",{layout: 'listUser',users:users});
            }
          })

    }
  });




})

app.post('/update',upload.single('avatar'), function (req, res,) {
  var connectUsers = db.model('users', user);
  connectUsers.find({_id:req.body.ide},
      function (error, users) {
        if (error) {

        } else {

          res.render("main",{layout: 'editUser',users:users});
        }
      })







})

app.post('/updateUser',upload.single('avatar'), function (req, res,) {
  var userUpdate= db.model('users',user);
  console.log(req.body.id);
  userUpdate.findByIdAndUpdate({_id :req.body.id},{
    name: req.body.name,
    address : req.body.address,
    DateOfBird : req.body.date,
    gioiTinh : req.body.gioitinh,
    soThich : req.body.sothich,
    phone : req.body.phone,
    avatar : "./public/data/uploads/" + req.file.filename
  },function (error,result) {
    if(error){
      res.send("loi")
    }else {
      // res.send("Thanh Cong")
      userUpdate.find({},
          function (error, users) {
            if (error) {

            } else {

              res.render("main",{layout: 'listUser',users:users});
            }
          })
    }
  })





})











module.exports = app;

