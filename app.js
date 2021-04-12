require('dotenv').config();
const express= require("express");
const bodyParser= require("body-parser");
const ejs= require("ejs");
const mongoose= require("mongoose");
const encrypt= require("mongoose-encryption");

const app= express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/secretDB", {useNewUrlParser:true, useUnifiedTopology:true});

const userSchema= new mongoose.Schema({
  name: String,
  password: String,
});

const secret= process.env.SECRET;

//Level 2 authentication using encryption
userSchema.plugin(encrypt, {secret: secret, excludeFromEncryption:["name"],decryptPostSave: false});

const User= mongoose.model("User",userSchema);

app.get("/", function(req, res)
{ res.render("home");
});

app.get("/login", function(req, res)
{ res.render("login");
});

app.get("/register", function(req, res)
{ res.render("register");
});

app.post("/register", function(req,res)
{ const username=req.body.username;
  const passwordUser=req.body.password;
 User.find({name:username}, function(err, result)
{ if(err)
  {console.log(err);}
 else {
 if(result.length!=0)
   {res.redirect("/login");}
   else {
     const user= new User({
       name:username,
       password: passwordUser,
     });

     user.save(function(err)
   { if(!err)
     {res.render("secrets");
     // console.log(user.password);
   }
   });
   }
 }
});
});

app.post("/login", function(req,res)
{ const username= req.body.username;
  const password= req.body.password;
  User.findOne({name:username}, function(err, result)
{ if(err)
  {console.log(err);}
  else {
    if(result){
  //Level 1 authentication. Moving the setup to the server
  //and checking password upon login. Hence allowing acces to
  //only those who have registered.
    if(result.password==password)
    {res.render("secrets");
    //Level 2 flaw: decryption upon find.
    // console.log(result.password);
  }
    else {
      res.redirect("/login");}}
      else {res.redirect("/register");}
  }
});

});

app.listen(3000, function()
{console.log("Connected");});
