const mongoose = require("mongoose");
const mongo = require("mongodb");
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment');
const startUpModel = new mongoose.Schema({
    paymentDetails: {
        type: Object,
        default: {}
    },
    companyName: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String,
        trim: true
    },
    thumbnail: {
        type: String,
        trim: true
    },
    connectionRequest: [],
    connections: [],
    notification: [],
    companyInfo: {
        type: String,
        trim: true
    },
    userId: {
        type: String
    },
    signUpDate: {
        type: String,
        default: moment().format("MMMM Do YYYY")
    },
    equityOffer: {
        type: Number

    },
    askPrice: {
        type: Number,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        trim: true
    },
    confirmPassword: {
        type: String,
        trim: true
    },
    founded: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: String,
        default:""
    },
    phase:{
        type:String,
        default:""
    },
    subscription: {
        type: String,
        enum: ["basic", "premium"],
        default: "basic"
    },
    industry: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    pitch: {
        type: String
    },
    legalName: {
        type: String
    },
    socialMedialink: {
        type: String,
        enum: ["Facebook", "instagram", "linkedIn"]
    },
    employeeCount: {
        type: String
    },
    companyValuation: {
        type: String
    },
    form: {
        type: String
    },
    headquarter: {
        type: String
    },
    websiteUrl: {
        type: String
    },
    yearlyGrossRevenue: {
        type: String
    },
    yearlyNetProfit: {
        type: String
    },
    lastQuarterGrossRevenue: {
        type: String
    },
    lastQuarterNetProfit: {
        type: String
    },
    lastMonthGrossRevenue: {
        type: String
    },
    lastMonthNetProfit: {
        type: String
    },
    assetsValue: {
        type: String
    },
    liabilitiesValue: {
        type: String
    },
    loans: {
        type: String
    },
    strength: {
        type: String
    },
    weakness: {
        type: String
    },
    opportunities: {
        type: String
    },
    threats: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    token: {
        type: String,
        default: '',
        expires: '7200'
    }
}, { timestamps: true });

module.exports = mongoose.model("startupModel", startUpModel);