const express=require ('express');
const session=require('express-session')
const path=require('path');
const bcrypt=require('bcrypt');
const dotenv=require('dotenv').config()
const expressLayouts=require('express-ejs-layouts')
const adminRouter=require('./router/adminRoute');
const userRouter=require('./router/userRoute');
const flash=require('connect-flash')
const mongodbConnection=require('./config/connection')
const nocache=require('nocache')
const passport=require('passport')

const app=express();
//port
const port=process.env.PORT || 3000

//flash
app.use(flash())

//database connection
mongodbConnection()

// nocache
app.use(nocache())

//path setting
app.use('/images',express.static(path.join(__dirname,'public','images')))
app.use('/style', express.static(path.join(__dirname,'public','style')))
app.use('/uploads', express.static(path.join(__dirname,'uploads')))
//static file
app.use(express.static('public'));
app.use(express.static('uploads'));


//body parser
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//session
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

//google auth
app.use(passport.initialize());
app.use(passport.session());

// Middleware to set res.locals.user
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});


//layouts
app.use(expressLayouts)
app.set('layout','./layouts/layout')


//set ejs as view engine
app.set('view engine','ejs');

//main route
app.get('/',(req,res)=>{
    res.redirect('/home')
})


//Main routes (Admin and User)
app.use('/admin',adminRouter);
app.use('/',userRouter);

//page not found route
app.get('*',(req,res)=>{
    res.render('pageNotFound' ,{title:'pageNotFound'})
})


//Port listening
app.listen(port,(err)=>{
    if(err){
        console.log(`there is an error${err}`);
    }else{
        console.log(`listening on port http://localhost:${port}`);
    }
})