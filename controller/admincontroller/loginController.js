// Load environment variables from .env file
const dotenv = require('dotenv').config()

// Admin middleware to check if admin is logged in
const admin = (req, res) => {
    try {
        // If admin session exists, redirect to admin login page
        if (req.session.admin) {
            res.redirect('/admin/login')
        }
    } catch (error) {
        // Log any error that occurs during redirection
        console.log(`error redirecting to admin page`)
    }
}


// Render login page for admin
const loginRender = (req, res) => {
    try {
        // If admin session exists, redirect to admin dashboard
        if (req.session.admin) {
            res.redirect('/admin/dashboard')
        } else {
            // Render login page with title and any flash messages
            res.render('admin/login', { title: 'login', alertMessage: req.flash('errorMessage') });
        }
    } catch (err) {
        // Log any error that occurs during rendering
        console.log(`Error on login render get ${err}`);
    }
}


// Handle admin login post request
const loginPost = (req, res) => {
    try {
        // Check if provided email and password match the admin credentials from environment variables
        if (req.body.email === process.env.ADMIN_MAIL && req.body.password === process.env.ADMIN_PASSWORD) {
            // Set admin session
            req.session.admin = req.body.email
            // Redirect to admin dashboard
            res.redirect('/admin/dashboard');
        }
        else {
            // Set flash message for invalid login and redirect to login page
            req.flash('errorMessage', 'Invalid Username or password');
            res.redirect('/admin/login');
        }
    } catch (err) {
        // Log any error that occurs during login
        console.log(`Error on login post: ${err}`);
    }
}

// Handle admin logout
const logout = (req, res) => {
    try {

        // Destroy admin session
        req.session.destroy((err) => {
            if (err) {
                // Log any error that occurs during session destruction
                console.log(`error during session logout${err}`)
            } else {
                // Redirect to admin dashboard after logout
                res.redirect('/admin/dashboard')
            }
        })
    } catch (error) {
        // Log any error that occurs during logout
        console.log(`Error on admin logout ${error}`)
    }
}



module.exports = {
    admin,
    loginRender,
    loginPost,
    logout,
}