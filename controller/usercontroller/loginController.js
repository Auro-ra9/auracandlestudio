const userSchema = require('../../model/userSchema')
const bcrypt = require('bcrypt')
const passport = require('passport')
require('../../services/auth')


//rendering lpgin page
const loginRender = (req, res) => {
    try {
        res.render('user/login', { title: 'login', alertMessage: req.flash('errorMessage'), user: req.session.user })
    } catch (err) {
        console.log(`Error on login render get ${err}`);
    }
}

const loginPost = async (req, res) => {
    try {



        // check the user details from Database
        const checkUser = await userSchema.findOne({ email: req.body.email });

        if (!checkUser) {
            req.flash('errorMessage', 'We could not find the user credentials');
            return res.redirect('/login');
        }

        if (checkUser.isBlocked === true) {
            req.flash('errorMessage', "Your account is blocked by admin. please contact for further details");
            return res.redirect('/login');

        }

        const comparePassword = await bcrypt.compare(req.body.password, checkUser.password);

        if (comparePassword) {
            req.session.user = checkUser.id;
            return res.redirect('/home');
        } else {
            req.flash('errorMessage', 'Invalid username or password');
            return res.redirect('/login');
        }
    } catch (err) {
        console.log(`Error on login post: ${err}`);
        req.flash('errorMessage', 'An error occurred during login');
        return res.redirect('/login');
    }
};

const registerRender = (req, res) => {
    try {
        res.render('user/register', { title: 'register', alertMessage: req.flash('errorMessage'), user: req.session.user })
    } catch (err) {
        console.log(`Error on register render get ${err}`)
    }

}

//registering account

const registerPost = async (req, res) => {
    try {

        const { name, email, password, phone, confirmPassword } = req.body
        //Server-side validation
        if (!name || !email || !phone || !password || !confirmPassword) {
            req.flash('errorMessage', 'All fields are required');
            return res.redirect('/user/register');
        }
        //storing userdata and encrypting the password
        const userData = {
            name: name,
            email: email,
            password: await bcrypt.hash(password, 10),
            phone: phone
        }

        console.log(userData);
        //to check whether the useremail already exists in the database or not
        const checkUserExist = await userSchema.find({ email: email })


        //if is a new user then storing it to the db
        if (checkUserExist.length === 0) {

            userSchema.insertMany(userData).then((result) => {
                req.flash('errorMessage', "User registration is successful")
                return res.redirect('/login')
            }).catch((err) => {
                console.log(`Error while inserting new user${err}`)
            })
        } else {
            req.flash('errorMessage', 'user already exist')
            return res.redirect('/login')
        }

    } catch (err) {
        console.log(`Error during signup post ${err}`);

    }
}

//google auth instance
const googleRender = (req, res) => {
    try {
        passport.authenticate('google', { scope: ['email', 'profile'] })(req, res);
    } catch (error) {
        console.log(`Error on google render: ${error}`);
    }
}

//google auth callback   
const googleCallback = (req, res, next) => {
    try {
        passport.authenticate('google', (err, user, info) => {
            if (err) {
                console.log(`Error on google Auth callback: ${err}`);
                return next(err);  // Passimg err to next middleware
            }
            // failure 
            if (!user) {
                return res.redirect('/login');
            }
            // successful
            req.logIn(user, (err) => {
                if (err) {
                    console.log(`Error during login: ${err}`);
                    return next(err);
                }
                req.session.user = user.id;
                return res.redirect('/home');
            });
        })(req, res, next);
    } catch (error) {
        console.log(`Error on google auth callback: ${error}`);
    }
}

//OTP and verification

const otpRender = (req, res) => {
    try {
        res.render('user/otp', { title: 'login', alertMessage: req.flash('errorMessage') })
    } catch (err) {
        console.log(`Error on otp render get ${err}`);
    }
}
const verificationRender = (req, res) => {
    try {
        res.render('user/verification', { title: 'veirification', alertMessage: req.flash('errorMessage') })
    } catch (err) {
        console.log(`Error on verification email render get ${err}`);
    }
}
const confirmPasswordRender = (req, res) => {
    try {
        res.render('user/confirmPassword', { title: 'confirm-password', alertMessage: req.flash('errorMessage') })
    } catch (err) {
        console.log(`Error on confirm password render get ${err}`);
    }
}




const logout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log(`error during session logout${err}`)
            } else {
                res.redirect('/login')
            }
        })
    } catch (error) {
        console.log(`Error on admin logout ${error}`)
    }
}


module.exports = {
    loginRender,
    loginPost,
    registerRender,
    registerPost,
    googleRender,
    googleCallback,
    otpRender,
    verificationRender,
    confirmPasswordRender,
    logout,


}

