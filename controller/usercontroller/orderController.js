const userSchema = require('../../model/userSchema');
const productSchema = require('../../model/productSchema');
const cartSchema = require('../../model/cartSchema');
const orderSchema = require('../../model/orderSchema');

const getOrders = async (req, res) => {
    try {
        // Pagination parameters
        const ordersPerPage = 8;
        const currentPage = parseInt(req.query.page) || 1
        const skip = (currentPage - 1) * ordersPerPage;

        // Counting the total number of orders
        const ordersCount = await orderSchema.countDocuments()
        const orders = await orderSchema.find({ userID: req.session.user, orderStatus: { $in: ['Pending', 'Confirmed', 'Shipping', 'Delivered'] } }).populate('products.productID').sort({ createdAt: -1 }).skip(skip).limit(ordersPerPage)


        res.render('user/orders',
            {
                title: 'orders',
                alertMessage: req.flash('errorMessage'),
                orders,
                currentPage,
                totalPages: Math.ceil(ordersCount / ordersPerPage)
            })
    } catch (err) {
        console.log('error on getting orders page', err)
    }
}



const cancelOrder = async (req, res) => {
    try {
        const orderid = req.params.orderid
        const orderDetails = await orderSchema.findById(orderid).populate('products.productID')
        if (!orderDetails) {
            req.flash('errorMessage', 'Order id could/t find')
            return res.redirect('/checkout')
        }

        //when tje product is being canceled then returninh the quantiy back to stock of admin
        for (let product of orderDetails.products) {
            product.productID.productQuantity += product.quantity
            await product.productID.save()
        }
        //saving the new startus in the db
        orderDetails.orderStatus = 'Cancelled'
        orderDetails.isCancelled = true
        orderDetails.reasonForCancel = req.body.cancelledReason
        await orderDetails.save()

        req.flash('errorMessage', 'product canceled successfully')
        res.redirect('/cancelled-orders')

    } catch (err) {
        console.log(`Error on cancel order post${err}`)
    }
}


const getCancelledOrders = async (req, res) => {
    try {
        // Pagination parameters
        const ordersPerPage = 8;
        const currentPage = parseInt(req.query.page) || 1
        const skip = (currentPage - 1) * ordersPerPage;

        // Counting the total number of orders
        const ordersCount = await orderSchema.countDocuments()
        const orders = await orderSchema.find({ userID: req.session.user, orderStatus: { $in: ['Pending-Returned', 'Returned', 'Cancelled'] } }).populate('products.productID').sort({ updatedAt: -1 }).skip(skip).limit(ordersPerPage)
        res.render('user/cancelledOrders',
            {
                title: 'orders',
                alertMessage:
                    req.flash('errorMessage'),
                orders,
                currentPage,
                totalPages: Math.ceil(ordersCount / ordersPerPage)
            })
        console.log(orders)
    } catch (err) {
        console.log('error on getting orders page', err)
    }
}


module.exports = {
    getOrders,
    cancelOrder,
    getCancelledOrders
}