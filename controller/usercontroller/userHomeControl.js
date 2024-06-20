const homeRender = (req, res) => {
    try {
        res.render('user/home', { title: 'home', alertMessage: req.flash('errorMessage'), user:req.session.user })
    } catch (err) {
        console.log(`Error on home render get ${err}`);
    }
}

module.exports = {
    homeRender,

}