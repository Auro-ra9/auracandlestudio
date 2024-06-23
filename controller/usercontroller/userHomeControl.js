const userSchema = require('../../model/userSchema');
const productSchema = require('../../model/productSchema')


const homeRender = async (req, res) => {
    try {

        // find all the products
        const products = await productSchema.find({ isAvailable: true })
        res.render('user/home', {
            title: 'home',
            alertMessage: req.flash('errorMessage'),
            user: req.session.user,
            products
        })
    } catch (err) {
        console.log(`Error on home render get ${err}`);
    }
}

//profileRender
const profileRender = async (req, res) => {
    try {
        const profileDetails = await userSchema.findById(req.session.user)
        res.render('user/profile', {
            title: 'profile',
            alertMessage: req.flash('errorMessage'),
            user: req.session.user,
            profileDetails
        })
    } catch (err) {
        console.log(`Error on user profile render get ${err}`);
    }
}

module.exports = {
    homeRender,
    profileRender,

}