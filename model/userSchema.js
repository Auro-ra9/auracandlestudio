const mongoose = require('mongoose')

const addressSchema = mongoose.Schema({

    pincode: {
        type: Number,
    },
    homeAddress: {
        type: String,
    },
    areaAddress: {
        type: String,
    },
    landmark: {
        type: String
    },
    state: {
        type: String
    }
}, { _id: false })


const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: Number
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    address: {
        type: [addressSchema],
        default: []
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    googleID: {
        type: String
    }
}, { timestamps: true })

module.exports = mongoose.model('user', schema)