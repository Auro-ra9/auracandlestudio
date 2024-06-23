const userSchema = require("../model/userSchema");


// function to check the user sesesion for other routes except home and product view page
function checkUserSession(req, res, next) {
    try {
        if (req.session.user) {
            next()
        }
        else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log("check user session ");
    }
}

// function to check the user sesesion in home page and product view page only
async function checkUserSessionBlocked(req, res, next) {
    try {
        if (req.session.user) {

            // get the data of the user
            const user = await userSchema.findById(req.session.user)

            if (user.isBlocked) {
                req.session.user = ''
                res.redirect('/login')
            } else {
                next()
            }

        } else {
            next()
        }
    } catch (error) {
        console.log(error);
    }
}


// function to check the user sesesion only for login and register
async function checkUserLogin(req, res, next) {
    try {
        if (req.session.user) {
            res.redirect('/home')
        } else {
            next()
        }
    } catch (error) {
        console.log(error);

    }
}



module.exports = {
    checkUserSession,
    checkUserSessionBlocked,
    checkUserLogin
}