const productSchema = require("../../model/productSchema");

const viewProductRender = async (req, res) => {
    try {

        const productID = req.params.productID

        const productDetail = await productSchema.findById(productID).populate('category')

        const similarProducts = await productSchema.find({ category: productDetail.category })

        if (!productDetail) {
            req.flash('errorMessage', "cannot find the product details");
            return res.redirect('/home')
        }

        res.render('user/viewProduct', {
            title: 'product-view',
            alertMessage: req.flash('errorMessage'),
            user: req.session.user,
            productDetail,
            similarProducts
        })

    } catch (err) {
        console.log(`Error on View product render get ${err}`);

    }
}

module.exports = {
    viewProductRender,
}