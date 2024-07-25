const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    },
   
}, { _id: false, timestamps: true });

const wishlistSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    items: [itemSchema],

});

module.exports = mongoose.model('wishlist', wishlistSchema);