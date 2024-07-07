const userSchema = require('../../model/userSchema')
const bcrypt = require('bcrypt')
const passport = require('passport')
require('../../services/auth')
const generateOTP = require('../../services/generateOTP')
const emailSender = require('../../services/emailSender')

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

        //to check whether the useremail already exists in the database or not
        const checkUserExist = await userSchema.find({ email: email })


        //if is a new user then storing it to the db
        if (checkUserExist.length === 0) {

            const otp = generateOTP()
            emailSender(email, otp)
            req.session.otp = otp
            req.session.otpCreatedAt = Date.now()
            req.session.name = name
            req.session.email = email
            req.session.password = await bcrypt.hash(password, 10),
                req.session.phone = phone

            res.redirect('/otp')

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
        res.render('user/otp', { title: 'otp', alertMessage: req.flash('errorMessage'), otpCreatedAt: req.session.otpCreatedAt })
    } catch (err) {
        console.log(`Error on otp render get ${err}`);
    }
}

const otpPost = async (req, res) => {
    try {

        if (Date.now() - req.session.otpCreatedAt > 2 * 60 * 1000) { // 1 minutes in milliseconds
            req.flash('errorMessage', "OTP Expired please try to send again");
            res.redirect('/otp');
        }


        const otpArray = req.body.otp;
        const otp = Number(otpArray.join(""))

        if (Number(req.session.otp) === otp) {
            const newUser = new userSchema({
                name: req.session.name,
                email: req.session.email,
                password: req.session.password,
                phone: req.session.phone
            })
            await newUser.save()

            // save the user id in session
            req.session.user = newUser.id
            res.redirect('/register-confirmed')
        } else {
            req.flash('errorMessage', "Invalid OTP please try to register again")
            res.redirect('/register')

        }

    } catch (err) {
        console.log(`Error on otp post ${err}`);
    }
}

const resendOTP = (req, res) => {
    try {

        const otp = generateOTP()
        emailSender(req.session.email, otp)
        req.session.otp = otp
        req.session.otpCreatedAt = Date.now()
        console.log(otp)
        return res.status(200).json({ message: "OTP resend" })

    } catch (err) {
        console.log(`Error on otp resend ${err}`);
    }
}

//welcome message for successful registration
const registerConfirmed = (req, res) => {
    try {
        res.render('user/registeredSuccessful',
            {
                title: 'register-confirmed',
                alertMessage:
                    req.flash('errorMessage')
            })
    } catch (err) {
        console.log('error on register confirm page rendering get:', err)
    }
}

//password forgot setting up with otp
const forgotPasswordRender = (req, res) => {
    try {
        res.render('user/forgotPassword', { title: 'forgot-password', alertMessage: req.flash('errorMessage') })
    } catch (err) {
        console.log(`Error on forgot password render get ${err}`);
    }
}

//email verification for sending otp
const forgotPasswordPost = async (req, res) => {
    try {

        const { email } = req.body
        //Server-side validation
        if (!email) {
            req.flash('errorMessage', 'Email is required for sending otp');
            return res.redirect('/user/login');
        }

        //to check whether the useremail already exists in the database or not
        const checkUserExist = await userSchema.findOne({ email: email })


        //if yes then sending otp to there
        if (checkUserExist) {
            const otp = generateOTP()
            emailSender(email, otp)
            req.session.otp = otp
            req.session.otpCreatedAt = Date.now()
            req.session.email = email
            req.session.userId = checkUserExist._id 
            res.redirect('/forgot-otp')

        } else {
            req.flash('errorMessage', 'we could not find the credentials ')
            return res.redirect('/login')
        }

    } catch (err) {
        console.log(`Error during password reset post ${err}`);

    }
}

//password otp rendering 
const passwordOtpRender = (req, res) => {
    try {
        res.render('user/forgotOtp', { title: 'otp', alertMessage: req.flash('errorMessage'), otpCreatedAt: req.session.otpCreatedAt })
    } catch (err) {
        console.log(`Error on otp forgot render get ${err}`);
    }
}

//verifying the otps
const passwordOtpPost = async (req, res) => {
    try {

        if (Date.now() - req.session.otpCreatedAt > 1 * 60 * 1000) { // 1 minutes in milliseconds
            req.flash('errorMessage', "OTP Expired please try to send again");
            res.redirect('/forgot-otp');
        }

        //checking the typed otp by user and here are same or not
        const otpArray = req.body.otp;
        const otp = Number(otpArray.join(""))

        if (Number(req.session.otp) === otp) {
            res.redirect('/reset-password')

        } else {
            req.flash('errorMessage', "Invalid OTP please try to register again")
            res.redirect('/login')

        }

    } catch (err) {
        console.log(`Error on otp post ${err}`);
    }
}

//resend password changing otp
const passwordResendOTP = (req, res) => {
    try {

        const otp = generateOTP()
        emailSender(req.session.email, otp)
        req.session.otp = otp
        req.session.otpCreatedAt = Date.now()
        console.log(otp)
        return res.status(200).json({ message: "OTP resend" })

    } catch (err) {
        console.log(`Error on otp resend ${err}`);
    }
}


//renderingh the new password change  page

const resetPasswordRender = (req, res) => {
    try {

        res.render('user/resetPassword', {
            title: 'reset-password',
            alertMessage: req.flash('errorMessage'),
        })

    } catch (er) {
        console.log(`error on reset-password page rendering: ${err}`)
    }
}
//allowing to change the password funally
const resetPasswordPost = async (req, res) => {
    try {

        //checking new passwords match or not
        const newPassword = req.body.password
        const confirmPassword = req.body.confirmPassword

        if (newPassword != confirmPassword) {
            req.flash('errorMessage', "the passwords do not match")
            return res.redirect('/reset-password')
        }

        //hashing the pass to store in db
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        //collecting the userID from email verifgication section
        const userId = req.session.userId

        //storung the new password to db
        await userSchema.findByIdAndUpdate(userId, { password: hashedPassword })

        req.flash('errorMessage', "Password changed successfully")
        return res.redirect('/login')

    } catch (err) {
        console.log(`error on new password adding post: ${err}`)
    }
}


//logout account
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
    otpPost,
    resendOTP,
    forgotPasswordRender,
    forgotPasswordPost,
    passwordOtpRender,
    passwordOtpPost,
    passwordResendOTP,
    resetPasswordRender,
    resetPasswordPost,
    registerConfirmed,
    logout,


}

