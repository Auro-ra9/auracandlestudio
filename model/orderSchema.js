const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid")

const schema = new mongoose.Schema({
    orderID: {
        type:String,
        unique:true,
        default:()=> `ORD-${uuidv4()}`

    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    products: [{
        productID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        },
        productName: {
            type: String
        },
        brand: {
            type: String
        },
        quantity: {
            type: Number
        },
        price: {
            type: Number
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'category'
        },
        discount: {
            type: Number
        },
        productImage: {
            type: String
        }
    }],
    totalPrice: {
        type: Number
    },
    address: {
        pincode: Number,
        homeAddress: String,
        areaAddress: String,
        city: String,
        landmark: String,
        state: String,
    },
    couponDiscount: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Cash on delivery', 'Razor pay', 'Wallet']
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    paymentId: {
        type: String,
        required: false
    },
    deliveryDate: {
        type: Date,
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Shipping', 'Delivered', 'Pending-Returned', 'Returned', 'Cancelled']
    },
    reasonForCancel: {
        type: String
    },
    returnRequest: {
        type: String
    },
    reasonForRejection: {
        type: String
    },
    couponID: {
        type: String
    }
}, { timestamps: true })


module.exports = mongoose.model("Order", schema);