const mongoose = require("mongoose");

const testimonialModel = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    uId:{
        type:String
    },
    profilePicture:{
        type:String,
        required:false
    },
    companyName:{
        type:String,
        required:true
    },
    designation:{
        type:String,
        required:true
    },
    testimonialContent:{
        type:String,
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

module.exports= mongoose.model("Testimonial",testimonialModel);