const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var uniqueValidator = require('mongoose-unique-validator');

const userSchema= new mongoose.Schema({

    name:{
        type:String,
        required: true,
        
    },
    email:{
         type:String,
        required: true,
         
         unique:true
    },
    mobile:{
        type:String,
        required: true,

         
         unique:true
    },
    image:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required: true,

        
    },
    password:{
        type:String,
        required: true,

        
    },
    country:{
        type:String,
        required: true,

        
    },
    state:{
        type:String,
        required: true,

        
    },
    city:{
        type:String,
        required: true,

        
    },
    pincode:{
        type:String,
        required: true,

        
    },
    workfield:{
        type:String,
        required: true,

        
    },
    is_admin:{
        type:Number,
        required: true,
    },
    is_verified:{
        type:Number,
        default:0
    },
    token:{
        type:String,
        default:''
    }
});

// userSchema.pre("save", async function (next) {

//     if (this.isModified("password")) {
//         this.password = await bcrypt.hash(this.password, 10);
//     }
//     next();
// })

userSchema.plugin(uniqueValidator, { message: '{PATH} already exists!' });
module.exports =mongoose.model('User',userSchema);