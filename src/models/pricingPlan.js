const mongoose = require("mongoose");

const pricingPlanModel = new mongoose.Schema({
    type: {
        type: String,
        // enum: ["investor", "startUp"]
    },
    basicPlan: {
        type: Number
    },
    premiumPlan: {
        type: Number
    },
    uId: {
        type: String
    },
    inputField1: {
        type: String,
        // required: true,
        // unique: true
    },
    inputField2: {
        type: String,
        // required: true,
        // unique: true
    },
    inputField3: {
        type: String,
        // required: true,
        // unique: true
    },
    inputField4: {
        type: String,
        // required: true,
        // unique: true
    },
    inputField5: {
        type: String,
        // required: true,
        // unique: true
    },
    inputField6: {
        type: String,
        // required: true,
        // unique: true
    },
    inputField7: {
        type: String,
        // required: true,
        // unique: true
    },
    inputField8: {
        type: String,
        // required: true,
        // unique: true
    },
    inputField9: {
        type: String,
        // required: true,
        // unique: true
    }
}, { timestamps: true });




module.exports = mongoose.model("PricingPlan", pricingPlanModel);
