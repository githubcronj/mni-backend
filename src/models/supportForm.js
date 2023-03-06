const mongoose = require("mongoose");
const moment = require("moment");

const supportSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    uId:{
        type:String,
        trim:true
    },
    date:{
        type:String,
        default :moment().format("MMMM Do YYYY, h:mm:ss a")
    },
    email: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        trim: true
    },
    typeOfIssue: {
        type: String
    },
    description: {
        type: String
    },
    isDeleted:{
        type:String
    },
    status:{
        type:String,
        default:"New",
        enum:["New","Pending","Solved"]
    }
}, { timestamps: true });

module.exports = mongoose.model("supportForm", supportSchema);