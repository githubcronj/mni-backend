const mongoose = require("mongoose");
const moment = require('moment');
const investorSchema = new mongoose.Schema(
  {
    uId: { type: String },
    paymentDetails: {
      type: Object,
      default: {}
    },
    name: { type: String, trim: true },
    age: { type: String },
    subscription: {
      type: String,
      enum: ["basic", "premium"],
      default: "basic",
    },
    password: { type: String },
    confirmPassword: { type: String },
    occupation: { type: String, trim: true },
    phoneNumber: { type: String },
    industry: { type: String, trim: true },
    location: { type: String, trim: true },
    profilePicture: { type: String, trim: true },
    email: {
      type: String,
      unique: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      lowercase: true
    },
    description: { type: String, trim: true },
    companyName: { type: String, trim: true },
    areaOfExpertise: [],
    companiesBacked: [],
    connectionRequest: [],
    connections: [],
    notification: [],
    signUpDate: { type: String, default: moment().format("MMMM Do YYYY") },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    token: {
      type: String,
      default: '',
      expires: '7200'
    }
  },
  { timestamps: true }
);


module.exports = mongoose.model("Investors", investorSchema);

//signUpDate : {type:String, match: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/}

