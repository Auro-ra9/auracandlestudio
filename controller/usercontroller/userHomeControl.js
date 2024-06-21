const productSchema=require('../../model/productSchema')


const homeRender =async (req, res) => {
    try {

        // find all the products
        const products=await productSchema.find({isAvailable:true})


        res.render('user/home', { 
            title: 'home', 
            alertMessage: req.flash('errorMessage'), 
            user:req.session.user,
            products 
        })
    } catch (err) {
        console.log(`Error on home render get ${err}`);
    }
}

module.exports = {
    homeRender,

}