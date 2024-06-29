const dashboardRender = (req, res) => {
    try {
        res.render('admin/dashboard', { title: 'dashboard', alertMessage: req.flash('errorMessage') });
    } catch (err) {
        console.log(`Error on dashboard render: ${err}`);
    }
}


module.exports = {
    dashboardRender
}
