const productSchema = require("../../model/productSchema");
const mongoose=require('mongoose')

const viewProductRender = async (req, res) => {
    try {
      const productID = req.params.productID;
  
      // Validate productID
      if (!mongoose.Types.ObjectId.isValid(productID)) {
        req.flash('errorMessage', 'Invalid product ID');
        return res.redirect('/home');
      }
  
      const productDetail = await productSchema.findById(productID).populate('category');
  
      if (!productDetail) {
        req.flash('errorMessage', 'Cannot find the product details');
        return res.redirect('/home');
      }
  
      const similarProducts = await productSchema.find({ category: productDetail.category });
  
      res.render('user/viewProduct', {
        title: 'product-view',
        alertMessage: req.flash('errorMessage'),
        user: req.session.user,
        productDetail,
        similarProducts
      });
    } catch (err) {
      console.log(`Error on View product render get ${err}`);
      req.flash('errorMessage', 'An error occurred while retrieving the product details');
      res.redirect('/home');
    }
  };
  
  module.exports = {
    viewProductRender,
  };