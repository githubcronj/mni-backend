const mongoose = require("mongoose");

const blogModel = new mongoose.Schema({
    profilePicture: {
        type: String,
        required: false
    },
    blogId:{
        type:String
    },
    heading: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

module.exports = mongoose.model("blog", blogModel);

