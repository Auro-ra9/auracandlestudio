const mongoose=require('mongoose')


const schema=new mongoose.Schema({
    productName:{
        type:String
    },
    productQuantity:{
        type:Number,
    },
    productDescription:{
        type:String
    },
    productPrice:{
        type:Number
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',

    },
    discout:{
        type:Number
    },
    image:{
        type:[]
    },
    Brand:{
        type:String
    },
    isAvailable:{
        type:Boolean,
        default:true
    }
},{timestamps:true})


module.exports=mongoose.model('product',schema)