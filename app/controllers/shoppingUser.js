var mongoose = require('mongoose');
var express = require('express');

// express router // used to define routes 
var userRouter  = express.Router();
var productModel = mongoose.model('Product');
var Cart = require('../models/shoppingCart');
var responseGenerator = require('./../../libs/responseGenerator');

module.exports.controllerFunction = function(app) {
        userRouter.get('/dashboard',isLoggedIn, function(req, res,next){
            productModel.find({},function(err,allProducts){
            if(err){                
                res.send(err);
            }
            else{

                 res.render('dashboard',{products:allProducts});
            }

        });  
    });//end get dashboard details

    userRouter.get('/addToCart/:id',function(req,res,next){
            var productId=req.params.id;
            var cart = new Cart(req.session.cart ? req.session.cart.items : {});
    
    productModel.findById(productId, function (err, product) {
      if(err){
        return res.redirect('/Shopping');
      }
        cart.add(product, product.id);
        req.session.cart = cart;
        res.redirect('/Shopping');
    });
    });//end add to cart

    userRouter.get('/shoppingCart', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shoppingCart', {products: ''});
    }
    var cart = new Cart(req.session.cart.items);
    res.render('shoppingCart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});//end view shopping cart details

  userRouter.get('/reduce/:id', function(req, res, next) {
      var productId = req.params.id;
      var cart = new Cart(req.session.cart ? req.session.cart.items : {});

      cart.reduceByOne(productId);
      req.session.cart = cart;
      res.redirect('/Shopping/shoppingCart');
  });//end reduce item from cart

    userRouter.get('/remove/:id', function(req, res, next) {
      var productId = req.params.id;
      var cart = new Cart(req.session.cart ? req.session.cart.items : {});

      cart.removeItem(productId);
      req.session.cart = cart;
      res.redirect('/Shopping/shoppingCart');
    });

     userRouter.get('/createProduct',function(req,res){
       res.render('createProduct');

    });//end remove item from cart

      userRouter.get('/updateProduct/:itemTitle',function(req,res){
        productModel.findOne({'itemTitle':req.params.itemTitle},function(err,result){
          if(err){
            var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });
          }
          else if(result) {
            res.render('updateProduct',{Product:result});
          }
});// end productModel 

});//end get Update product screen
  

userRouter.post('/createProduct',function(req,res,done){
     productModel.findOne({'itemTitle':req.body.itemTitle},function(err,foundProduct){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundProduct){
                var myResponse = responseGenerator.generate(true,"Product already exist "+foundProduct.itemTitle,500,null);
                res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });
            }
  
       else if(req.body.itemTitle!=undefined && req.body.itemDescription!=undefined && req.body.itemPrice!=undefined && req.body.itemType!=undefined){

            var newProduct = new productModel({
                itemTitle           : req.body.itemTitle,
                itemDescription     : req.body.itemDescription,
                itemPrice           : req.body.itemPrice,
                itemType            : req.body.itemType               
            });

          //lets update the modified date
          var today=Date.now();
          newProduct.createdDate=today;
            newProduct.save(function(err){
                if(err){

                    var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                   //res.send(myResponse);
                   res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });

                }
                else{
                   res.redirect('/Shopping')
                }

            });//end new product save


        }
        else{

            var myResponse = {
                error: true,
                message: "Some body parameter is missing",
                status: 403,
                data: null
            };

             res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
              });

        }
        });

    });//end create product

  userRouter.put('/updateProduct',function(req,res){

    var update={};

      //  update.itemTitle =req.body.itemTitle,
        update.itemDescription=req.body.itemDescription;
        update.itemPrice=req.body.itemPrice;
        update.itemType=req.body.itemType;   
        
        //lets update the modified date
        var today=Date.now();
        update.modifiedDate=today;
            productModel.update({'itemTitle':req.body.itemTitle},update,function(err){
                if(err){
                    var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                   //res.send(myResponse);
                   res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });

                }
                else{
                   res.redirect('/Shopping')
                }

            });//end update product 

    });//end update a product

//start route to delete a blog using _id
 userRouter.post('/deleteProduct/:itemTitle',function(req,res){
  productModel.remove({'itemTitle':req.params.itemTitle},function(err,result){
        
    if(err){
       var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                   //res.send(myResponse);
                   res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });
    }
    else if(result.n>0){
      console.log("Product deleted successfully");
      res.redirect('/Shopping');
    }
      else if(result.n===0){
        console.log("Product delete failure");
        res.redirect('/Shopping');
    }
  });// end remove productModel
});//end delete products

 // this should be the last line
    // now making it global to app using a middleware
    // think of this as naming your api 
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
