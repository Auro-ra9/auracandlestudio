const userSchema = require('../../model/userSchema');
const productSchema = require('../../model/productSchema');
const cartSchema = require('../../model/cartSchema');
const orderSchema = require('../../model/orderSchema');

const getOrders = async (req, res) => {
    try {
        const profileDetails = await userSchema.findById(req.session.user)
        const orders = await orderSchema.find({ userID: req.session.user })

        if (!profileDetails) {
            req.flash('errorMessage', "Profile id not found");
            return res.redirect('/profile',)
        }

        res.render('user/orders',
            {
                title: 'orders',
                alertMessage:
                    req.flash('errorMessage'),
                orders
            })
    } catch (err) {
        console.log('error on getting orders page', err)
    }
}






module.exports = {
    getOrders,
}