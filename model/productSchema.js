const mongoose = require('mongoose')


const schema = new mongoose.Schema({
    productName: {
        type: String
    },
    productQuantity: {
        type: Number,
    },
    productDescription: {
        type: String
    },
    productPrice: {
        type: Number
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',

    },
    discount: {
        type: Number
    },
    image: {
        type: [String]
    },
    brand: {
        type: String
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })


module.exports = mongoose.model('product', schema)