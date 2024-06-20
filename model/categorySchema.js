const mongoose = require('mongoose')


const schema = new mongoose.Schema({
    categoryName: {
        type: String
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


module.exports = mongoose.model('category', schema)