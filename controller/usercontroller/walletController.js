const userSchema = require('../../model/userSchema');
const productSchema = require('../../model/productSchema');
const cartSchema = require('../../model/cartSchema');
const orderSchema = require('../../model/orderSchema');
const walletSchema = require('../../model/walletSchema');

//render wallet page
const walletGet = async (req, res) => {
    try {
        // Pagination parameters
        const refundPerPage = 8;
        const currentPage = parseInt(req.query.page) || 1
        const skip = (currentPage - 1) * refundPerPage;


        // Counting the total number of refund
        const refundCount = await orderSchema.countDocuments()
        const orders = await orderSchema.find({ userID: req.session.user, orderStatus: {$in:['Returned', 'Cancelled']} }).populate('products.productID').sort({ createdAt: -1 }).skip(skip).limit(refundPerPage)
        const walletOrders = await orderSchema.find({ userID: req.session.user,paymentMethod:'Wallet', orderStatus: {$nin:['Returned', 'Cancelled']} }).populate('products.productID').sort({ createdAt: -1 }).skip(skip).limit(refundPerPage)
        const refundedItems= orders.filter((order)=>{
            if(order.orderStatus==='Cancelled'&& order.paymentMethod==='Cash on delivery'){
                console.log(order)
            }else{
                return order

            }
        })
        const wallet= await walletSchema.findOne({userID:req.session.user})
        let balance=0
        if(wallet){
            balance= wallet.balance
        }
        res.render('user/wallet',
            {
                title: 'orders',
                alertMessage: req.flash('errorMessage'),
                orders:[...refundedItems,...walletOrders],
                balance,
                currentPage,
                totalPages: Math.ceil(refundCount / refundPerPage)
            })
    } catch (err) {
        console.log('error on getting wallet page', err)
    }
}






module.exports = {
    walletGet,

}