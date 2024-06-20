
const dotenv= require('dotenv').config()

const admin=(req,res)=>{
    try {
        if(req.session.admin){
            res.redirect('/admin/login')
        }
    } catch (error) {
        console.log(`error redirecting to admin page`)
    }
}



const loginRender = (req, res) => {
    try {
        if(req.session.admin){
            res.redirect('/admin/dashboard')
        }else{
            res.render('admin/login', { title: 'login', alertMessage: req.flash('errorMessage')});
        }
    } catch (err) {
        console.log(`Error on login render get ${err}`);
    }
}

    

const loginPost = (req,res) => {
    try{
        if(req.body.email===process.env.ADMIN_MAIL && req.body.password===process.env.ADMIN_PASSWORD){
            req.session.admin=req.body.email
            res.redirect('/admin/dashboard');
        }
        else{
            req.flash('errorMessage', 'Invalid Username or password');
            res.redirect('/admin/login');
        }
    }catch (err) {
        console.log(`Error on login post: ${err}`);
    }
}

const logout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log(`error during session logout${err}`)
            } else {
                res.redirect('/admin/dashboard')
            }
        })
    } catch (error) {
        console.log(`Error on admin logout ${error}`)
    }
}



module.exports={
    admin,
    loginRender,
    loginPost,
    logout,
}