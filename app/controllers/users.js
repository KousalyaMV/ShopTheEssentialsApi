var mongoose = require('mongoose');
var express = require('express');

// express router // used to define routes 
var userRouter  = express.Router();
var userModel = mongoose.model('User');
var productModel = mongoose.model('Product');
var responseGenerator = require('./../../libs/responseGenerator');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports.controllerFunction = function(app) {

    userRouter.get('/',function(req,res,next){
          productModel.find({},function(err,allProducts){
            if(err){                
                res.send(err);
            }
            else{
                 res.render('dashboard',{products:allProducts});
            }

        });  
       
    });//end get viewProduct
     userRouter.get('/profile',isLoggedIn, function(req, res){
           res.render('profile',{profile:req.session.user});
    });//end get profile details

    userRouter.get('/logout',isLoggedIn,function(req,res){
      req.logout();
      req.session.destroy();
      res.redirect('/Shopping/login');

    });//end logout
 passport.serializeUser(function (user, done) {
          done(null, user.id);
      });

      passport.deserializeUser(function (id, done) {
          userModel.findById(id, function (err, user) {
              done(err, user);
          });
      });

  userRouter.get('/signup',function (req, res, next) {
    var message=req.flash('message');
    message=message.length>0 ?  message :'';
          res.render('signup',{message:message});
      });

  userRouter.post('/signup', passport.authenticate('local.signup', {
          successRedirect: '/Shopping/dashboard',
          failureRedirect: '/Shopping/signup',
          passReqToCallback: true,
          failureFlash: true
      }));

  userRouter.get('/login',function (req, res, next) {
           var message=req.flash('message');
    message=message.length>0 ?  message :'';
          res.render('login',{message:message});
      });

  userRouter.post('/login', passport.authenticate('local.signin', {
          successRedirect: '/Shopping/dashboard',
          failureRedirect: '/Shopping/login',
          passReqToCallback: true,
          failureFlash: true

      }));

      passport.use('local.signup', new LocalStrategy({
          usernameField: 'email',
          passwordField: 'password',
          passReqToCallback: true,
          failureFlash: true
      }, function (req, email, password, done) {
        process.nextTick(function () {
          userModel.findOne({'email': email}, function (err, user) {
              if (err) {
                   return done(err); 
              }
              if (user) {
                console.log(user);
                return done(null, false,req.flash('message',"Email is already in use."));
              }
               var newUser = new userModel({
                userName            : req.body.firstName+''+req.body.lastName,
                firstName           : req.body.firstName,
                lastName            : req.body.lastName,
                email               : req.body.email            

            });// end new user
               newUser.password = newUser.generateHash(password);
              newUser.save(function(err, result) {
                 if (err) {
                    return done(err);
                 }
                 else{
                  req.session.user = newUser;
                   delete req.session.user.password;
                   }
                   console.log(newUser);
                 return done(null, newUser);
              });
          });
        });
      }));

      passport.use('local.signin', new LocalStrategy({
          usernameField: 'email',
          passwordField: 'password',
          passReqToCallback: true,
          failureFlash: true
      }, function(req, email, password,done) {
          userModel.findOne({'email': email}, function (err, foundUser) {
              if (err) {
                  return done(err);
              }
              if (!foundUser) {
                  return done(null, false,req.flash('message',"No user found"));
              }
              if (!foundUser.validPassword(password)) {
                  return done(null, false,req.flash('message',"Wrong password"));
              }
              else{
                req.session.user = foundUser;
                   delete req.session.user.password;
              }
              return done(null,foundUser);
          });
      }));
   
   userRouter.get('/forgotPassword',function(req,res){
      res.render('forgotPassword');

    });//end get forgotPassword
   userRouter.put('/forgotPass',function(req,res){
       if(req.body.confirmPassword!=req.body.newPassword){
          res.render('forgotPassword',{message:"password dont match"});
        } 
        else{
          process.nextTick(function () {
         var update={};
          update.email=req.body.email;
          var userPass = new userModel();
        update.password=userPass.generateHash(req.body.confirmPassword); 
        //lets update the modified date
        var today=Date.now();
        update.modifiedDate=today;
            userModel.update({'email':req.body.email},update,function(err,result){
                if(err){

                    var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                   //res.send(myResponse);
                   res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });

                }
                else if (result.nModified===0){
                   res.render('forgotPassword',{message:"User does not exist"});
                }
                else{
                   res.render('login',{message:"password changed successfully..Please login"});
                }

            });//end update password 
          });
}
    });//end update a password

 // this should be the last line
    // now making it global to app using a middleware 
    app.use('/Shopping', userRouter);

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/Shopping');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/Shopping/login');
}
   
} //end controller code
