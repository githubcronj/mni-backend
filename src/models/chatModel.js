const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    to: {type:String, trim:true},
    from: {type: String, trim:true},
    message: [{
        date: {type:Date, default:Date.now("<YYYY-mm-ddTHH:MM:ss>")},
        msg : {type: String, trim:true},
        from: {type:String, trim:true},
        _id:0
    }]
}, {timestamps: true});

module.exports = mongoose.model('Chat', chatSchema);


