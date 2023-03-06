const mongoose = require("mongoose");


const chatSchema = new mongoose.Schema({
    from: {
        type: String
    },
    to: {
        type: String
    },
    content:{
        type:String
    },
    msg: []
}, { timestamps: true });

module.exports = mongoose.model("chat", chatSchema);

