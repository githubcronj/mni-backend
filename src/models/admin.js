const mongoose = require("mongoose");
const moment = require('moment');

const adminUserModel = new mongoose.Schema({
    name: {
        type: String,
        // required: true,
        trim: true
    },
    userId:{
        type:String,
        trim:true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        lowercase: true
        // unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    confirmPassword: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String,
        required: false
    },
    phoneNumber:{
        type:String,
        // required:true,
        // unique:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    role:{
        type:String
    },
    status:{
        type:String,
        enum:["Active","Inactive"],
        default:"Active"
    },
    date: {
        type: String,
        default: moment().format("MMMM Do YYYY")
    }

}, { timestamps: true });

module.exports = mongoose.model("registerAdmin", adminUserModel);