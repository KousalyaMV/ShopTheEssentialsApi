
// defining a mongoose schema 
// including the module
var mongoose = require('mongoose');
// declare schema object.
var Schema = mongoose.Schema;

var productSchema = new Schema({

	itemTitle 		  : {type:String,default:'',required:true},
	itemDescription   : {type:String,default:''},
	itemPrice  		  : {type:Number,default:''},
	createdDate	      : {type:Date,default:''},
	modifiedDate      : {type:Date,default:''},
	itemType          : {type:String,default:''},
	itemRating        : {type:Number,default:''}
});


module.exports=mongoose.model('Product',productSchema);