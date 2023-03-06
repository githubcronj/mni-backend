const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
    loginImage:{
        type:String
    },
    type:{
        type:String
    }
},{timestamps:true});

module.exports = mongoose.model("settingsModel",settingSchema);

