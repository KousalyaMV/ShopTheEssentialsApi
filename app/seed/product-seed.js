
var Product = require('../models/ShoppingProduct');

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ECommerceDb');

var products = [
    new Product({
        itemTitle         : 'Gothic Video Game',
        itemDescription   : 'Awesome Game!!!!',
        itemPrice         :  10000,
        createdDate       :  Date.now(),
        itemType          :  'Game',
        itemRating        :   5
    }),
    new Product({
        //imagePath: 'http://eu.blizzard.com/static/_images/games/wow/wallpapers/wall2/wall2-1440x900.jpg',
        itemTitle         : 'World of Warcraft Video Game',
        itemDescription   : 'Also awesome? But of course it was better in vanilla ...',
        itemPrice         :  20000,
        createdDate       :  Date.now(),
        itemType          :  'Game',
        itemRating        :   5
    }),
    new Product({
        itemTitle         : 'Call of Duty Video Game',
        itemDescription   : 'Meh ... nah, its okay I guess',
        itemPrice         :  20000,
        createdDate       :  Date.now(),
        itemType          :  'Game',
        itemRating        :   5
    }),
    new Product({
        itemTitle         : 'Minecraft Video Game',
        itemDescription   : 'Now that is super awesome!',
        itemPrice         :  20000,
        createdDate       :  Date.now(),
        itemType          :  'Game',
        itemRating        :   5
    }),
    new Product({
        itemTitle         : 'Dark Souls 3 Video Game',
        itemDescription   : 'I died!',
        itemPrice         :  20000,
        createdDate       :  Date.now(),
        itemType          :  'Game',
        itemRating        :   5
    })
];

var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save(function(err, result) {
        done++;
        if (done === products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
