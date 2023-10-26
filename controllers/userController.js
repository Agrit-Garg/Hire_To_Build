const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");

const randomstring = require("randomstring");
const config = require("../config/config");


const  securePassword = async(password) =>{
    
    try{
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    }
    catch(error){
        console.log(error.message);
    }
}



const loadHome = async (req, res) => {
    try {
        res.render('home');
    }
    catch (error) {
        console.log(error.message);
    }
}

const loadLogin = async (req, res) => {
    try {
        res.render('login');
    }
    catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async (req, res) => {
    try {
        res.render('registeration');
    }
    catch (error) {
        console.log(error.message);
    }
}

const loadForget = async (req, res) => {
    try {
        res.render('forget');
    }
    catch (error) {
        console.log(error.message);
    }
}



const loadSearch = async (req, res) => {
    try {
        const city = req.body.qcity;
        if (city === "") {
            const query = {
                workfield: req.body.qwork,
                country: req.body.qcountry,
                state: req.body.qstate
            }
            const usersData = await User.find(query);
            res.render('search', { users: usersData });

        }
        else {
            const query = {
                workfield: req.body.qwork,
                country: req.body.qcountry,
                state: req.body.qstate,
                city: req.body.qcity
            }
            const usersData = await User.find(query);
            res.render('search', { users: usersData });

        }

    }
    catch (error) {
        console.log(error.message);
    }
}

//REGISTRAION PROCESS
const insertUser = async (req, res) => {

    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if (password === cpassword) {
            const spassword = await securePassword(password);
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mno,
                image: req.file.filename,
                gender: req.body.gender,
                password: spassword,
                country: req.body.country,
                state: req.body.state,
                city: req.body.city,
                pincode: req.body.pincode,
                workfield: req.body.workfield,


                is_admin: 0
            });

            const userData = await user.save();
            if (userData) {
                sendVerifyMail(req.body.name, req.body.email, userData._id);
                res.render('registeration', { regsucmessage: "Your are registered Successfully. Please verify email" });
                // res.send("Successfully Register");
            }
            else {
                res.render('registeration', { regsucmessage: "Failed to Register" });
                // res.send("Registeration Failed");

            }
        }

        else {
            res.render('registeration', { message: "Password not match" });
        }
    }
    catch (error) {
        console.log(error.message);
        var valerror = error.message.slice(24,);
        res.render('registeration', { message: valerror });
        // console.log(error.message);
    }
}


const loadHomeLogin = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id });
        res.render('homelogin', { user: userData });//we get data of the persion whose session is created
    } catch (error) {
        console.log(error.message);
    }
}


// for verification
const verifyLogin = async (req, res) => {

    try {

        const email = req.body.email;
        const password = req.body.password;
        
        
        const userData = await User.findOne({ email: email });
        
        
        if (userData) {
            const isMatch = await bcrypt.compare(password,userData.password);//this (await) is really important because we cannot bcrypt from body.req.password

            if (isMatch) {
                req.session.user_id = userData._id;
                res.redirect('/homelogin');
            }
            else {
                res.render('login', { message: "Password is incorrect" });
            }

        }
        else {
            res.render('login', { message: "Email and password is incorrect" })
        }
    } catch (error) {
        console.log(error.message)

    }
    // try{
    //     const email = req.body.email;
    //     const password = req.body.password;

    //     const userData = await User.findOne({ email: email });

    //     if (userData) {

    //         if (password === userData.password) {
    //             req.session.user_id = userData._id;
    //             res.redirect('/homelogin');
    //         }
    //         else {
    //             res.render('login', { message: "password is incorrect" });
    //         }

    //     }
    //     else {
    //         res.render('login', { message: "Email and password is incorrect" })
    //     }

    // }
    // catch(error){
    //     console.log(error.message);
    // }
}

//logout
const userLogout = async (req, res) => {
    try {

        req.session.destroy();
        res.redirect('/index');
    } catch (error) {
        console.log(error.message);
    }
}

//user profile edit and save

const editLoad = async (req, res) => {

    try {

        //when we get data from url,we use query
        const id = req.query.id;//homelogin page nav link
        const userData = await User.findById({ _id: id });

        if (userData) {
            res.render('edit', { user: userData });
        }
        else {
            res.redirect('/homelogin');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const profileLoad = async (req, res) => {
    try {
        const id = req.query.id;//homelogin page nav link
        const userData = await User.findById({ _id: id });
        if (userData) {
            res.render('viewpage', { user: userData });
        }
        else {
            res.redirect('/search');
        }
    }
    catch {
        console.log(error.message)
    }
}

const updateProfile = async (req, res) => {

    try {

        if (req.file) {//req.file is for image 
            const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { name: req.body.name, country: req.body.country, mobile: req.body.mno, state: req.body.state, city: req.body.city, pincode: req.body.pincode, image: req.file.filename } });
        }
        else {
            const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { name: req.body.name, country: req.body.country, mobile: req.body.mno, state: req.body.state, city: req.body.city, pincode: req.body.pincode } });

        }
        res.redirect('/homelogin');

    } catch (error) {
        console.log(error.message);
    }
}

// send email  
const sendVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'Email Verification',
            html: ' <p>Dear '+name+'</p><p>Thank you for registering on Hire To Build! To complete your registration, please click the link below to verify your account and start using our platform to connect with local repair and builder workers:</p><p><a href="http://localhost:3000/verify?id=' + user_id + '">CLICK HERE</a></p><p>Thank you for choosing Hire To Build.</p><p>Best regards,<br>The Hire To Build Team</p>'
            // html: '<p>Hii ' + name + ',please click here to <a href="http://localhost:3000/verify?id=' + user_id + '"> Verify</a> your mail.</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been sent:-", info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}



//verify mail

const verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });

        console.log(updateInfo);
        //   res.render("email-verified");
        res.render('registeration', { regsucmessage: "Email Verified Successfully." });

    } catch (error) {
        console.log(error.message);
    }
}


//FORGET PASSWORD SECTION

//reset password mail 
const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });
        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: ' <p>Dear '+name+'</p><p>Thank you for registering on Hire To Build! To complete your registration, please click the link below to verify your account and start using our platform to connect with local repair and builder workers:</p><p><a href="http://localhost:3000/forget-password?token='+token+'">RESET YOUR PASSWORD</a></p><p>Thank you for choosing Hire To Build.</p><p>Best regards,<br>The Hire To Build Team</p>'
            // html: '<p>Hii ' + name + ',please click here to <a href="http://localhost:3000/verify?id=' + user_id + '"> Verify</a> your mail.</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been sent:-", info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async (req,res) => {
    try{
        const email = req.body.email;
        const userData = await User.findOne({email:email});
        if(userData)
        {
            
            if(userData.is_verified === 0)
            {
                res.render('forget',{message:"Please verify your email"});
            }
            else{
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({email:email},{$set:{token:randomString}});
                sendResetPasswordMail(userData.name,userData.email,randomString);
                res.render('forget',{message:"Please check your email to reset password"}) 

            }
        }
        else{
            res.render('forget',{message:"email is incorrect"}) 
        }
    }
    catch(error){
        console.log(error.message);
    }

}

const forgetPasswordLoad = async (req,res) => {
    try{
        const token = req.query.token;
        const tokenData = await User.findOne({token:token});
        if(tokenData){
            res.render('password',{user_id:tokenData._id})
        }
        else{
            res.send("token is invalid")
        }



    }
    catch(error)
    {
        console.log(error.message)
    }
}

const resetPassword = async (req,res) => {
    try{
        const password = req.body.password;
        const user_id = req.body.user_id;
        const secure_password = await securePassword(password)
        const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}})
        res.redirect("/index");
    }
    catch(error){
        console.log(error.message)
    }
}











module.exports = {
    loadHome,
    loadRegister,
    insertUser,
    loadLogin,
    loadSearch,
    verifyLogin,
    editLoad,
    userLogout,
    updateProfile,
    loadHomeLogin,
    profileLoad,
    loadForget,
    sendVerifyMail,
    verifyMail,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword
}