const userSchema = require('../../model/userSchema');
const productSchema = require('../../model/productSchema');
const cartSchema = require('../../model/cartSchema');
const orderSchema = require('../../model/orderSchema');
const walletSchema = require('../../model/walletSchema');

//render wallet page
const walletGet = async (req, res) => {
    try {
        // Pagination parameters
        const itemsPerPage = 10;
        const currentPage = parseInt(req.query.page) || 1;
        const skip = (currentPage - 1) * itemsPerPage;

        // Fetching refund orders
        const refundOrders = await orderSchema.find({ userID: req.session.user, orderStatus: { $in: ['Returned', 'Cancelled'] } })
            .populate('products.productID')
            .sort({ createdAt: -1 });

        // Fetching wallet orders
        const walletOrders = await orderSchema.find({ userID: req.session.user, paymentMethod: 'Wallet', orderStatus: { $nin: ['Returned', 'Cancelled'] } })
            .populate('products.productID')
            .sort({ createdAt: -1 });

        // Filtering refund items
        const refundedItems = refundOrders.filter(order => {
            if (order.orderStatus === 'Cancelled' && order.paymentMethod === 'Cash on delivery') {
               
                return false;
            } else {
                return true;
            }
        });

        //find referal details if any
        const referalUsedUsers= await userSchema.find({referredBy:req.session.user}).countDocuments()

        // Combining refundedItems and walletOrders
        const combinedItems = [...refundedItems, ...walletOrders];

        // Calculating total pages
        const totalItems = combinedItems.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Paginating the combinedItems array
        const paginatedItems = combinedItems.slice(skip, skip + itemsPerPage);

        // Fetching wallet balance
        const wallet = await walletSchema.findOne({ userID: req.session.user });
        let balance = 0;
        if (wallet) {
            balance = wallet.balance;
        }

        res.render('user/wallet', {
            title: 'Wallet',
            alertMessage: req.flash('errorMessage'),
            orders: paginatedItems,
            balance,
            currentPage,
            totalPages,
            query: req.query,
            referalEarnings: referalUsedUsers
        });
    } catch (err) {
        console.log('error on getting wallet page', err);
        res.status(500).send('An error occurred');
    }
};






module.exports = {
    walletGet,

}