const mongoose = require("mongoose");
const emailValidator = require("email-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { regex, errorMessage, successMessage, statusCodes, tokenGeneration, confirmEmail } = require("../util/utility");


const isEmptyBody = function (data) {
    if (Object.keys(data).length == 0) return true
}
const isValidEmail = function (email) {
    return emailValidator.validate(email);
}
const isValidPassword = function (password, confirmPassword) {
    var test = regex.password.test(password);
    if (test && password === confirmPassword) return true;
}

const updatePasswordValid = (pass) => {
    return regex.password.test(pass);
}

const isValidPhone = function (data) {
    if (data.length > 7 && data.length <= 15) {
        return regex.phone.test(data);
    }
}

const isValidName = function (name) {
    if (name) {
        return regex.name.test(name);
    }
}

const isLoggedIn = function (payload, secretKey, expiration) {
    return jwt.sign(payload, secretKey, expiration);
}

const hasEncryptPassword = function (originalPassword) {
    return bcrypt.hashSync(originalPassword, 10);
}

const isDecryptPassword = function (originalPassword, hashPassword) {
    return bcrypt.compareSync(originalPassword, hashPassword);
}

const isPresent = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}
const isValidObjectId = function (id) {
    return mongoose.Types.ObjectId.isValid(id);
}

const isValidPosition = function (data) {
    return regex.position.test(data);
}

const isPaymentDone = function () {
    return true;
}

const hasClicked = function (value) {
    return value;

}

const getErrorField = (data, value) => {
    return Object.keys(data).find(key => data[key] === value);
}

function countDashboard(a) {
    count = a.length;
    var monthArr = new Array();
    let result = [];
    for (let i = 0; i < count; i++) {
        monthArr.push(a[i]._id.month);
        result.push({ month: a[i]._id.month, total: a[i].total })
    }
    for (let j = 1; j <= 12; j++) {
        if (monthArr.indexOf(j) == -1) {
            result.push({ month: j, total: 0 });
        }
    }
    return result.sort((a, b) => a.month - b.month);
}

function setExpiration() {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    return future.getTime();
}

function checkExpiration(expirationTimestamp) {
    const now = new Date();
    const nowTimeStamp = now.getTime();
    const microSecondsDiff = Math.abs(expirationTimestamp - nowTimeStamp);
    // Math.round is used instead of Math.floor to account for certain DST cases
    // Number of milliseconds per day =
    //   24 hrs/day * 60 minutes/hour * 60 seconds/minute * 1000 ms/second
    const daysDiff = Math.round(microSecondsDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
}

module.exports = {
    isEmptyBody,
    isValidEmail,
    isValidPassword,
    isValidPhone,
    isValidName,
    isLoggedIn,
    isDecryptPassword,
    hasEncryptPassword,
    isPresent,
    isValidObjectId,
    isValidPosition,
    isPaymentDone,
    hasClicked,
    updatePasswordValid,
    getErrorField,
    countDashboard,
    setExpiration,
    checkExpiration
};