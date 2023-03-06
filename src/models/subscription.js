const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

const subscriptionModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    profileImage: {
        type: String,
        required: false
    },
    userId: {
        type: objectId,
    },
    subscriptionPlan: {
        type: String,
        enum: ["Basic", "Premium"],
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    renewalDate: {
        type: String
    },
    purchaseDate: {
        type: String
    },
    type:{
        type:String,
        enum:["startUp","investor"]
    }
}, { timestamps: true });

module.exports = mongoose.model("subscriptionData", subscriptionModel);