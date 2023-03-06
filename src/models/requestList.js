const mongoose = require('mongoose');

const requestListSchema = new mongoose.Schema({
    requestComingFrom : {type:String, trim:true},
    requestGoingTo : {type: String, trim:true},
    status : {
        type:String,
        enum:["accept", "reject","pending"],
        default:"pending"
    },
    connectionRequest: []

}, {timestamps: true});

module.exports = mongoose.model('RequestList', requestListSchema);