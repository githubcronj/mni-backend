const sgMail = require("@sendgrid/mail");
require('dotenv').config();
const startupModel = require('../models/startUp');
const investorModel = require("../models/investor");
const adminModel = require("../models/admin");
const { statusCodes, errorMessage, successMessage } = require("../util/utility");

const forgotPassword = async (req, res) => {
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        let { email } = req.body;
        let identify = req.query.key;
        if (identify.toLowerCase() === "startup") {
            const authenticate = await startupModel.findOne({ email: email });
            if (authenticate === null) {
                return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.authenticate });
            }
            const msg = {
                to: email,
                from: 'ishvinder@cronj.com',
                subject: 'Request to change password',
                text: `Your Original Password was ${authenticate.confirmPassword}`,
                html:`<strong>Your Original Password was ${authenticate.confirmPassword}</strong>`,
            };
            sgMail
                .send(msg)
                .then(() => { }, error => {
                    console.error(error);

                    if (error.response) {
                        console.error(error.response.body)
                    }
                });
            return res.send("Check your email for recovering password.")        
        }
        else if (identify.toLowerCase() === "investor") {
            const authenticate = await investorModel.findOne({ email: email });
            if (authenticate === null) {
                return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.authenticate });
            }
            const msg = {
                to: email,
                from: 'ishvinder@cronj.com',
                subject: 'Request to change password',
                text: `Your Original Password was ${authenticate.confirmPassword}`,
                html: `<strong>Your Original Password was ${authenticate.confirmPassword}</strong>`,
            };
            sgMail
                .send(msg)
                .then(() => { }, error => {
                    console.error(error);

                    if (error.response) {
                        console.error(error.response.body)
                    }
                });
            return res.send("EMail Send Successfully.")    
        }
        else if (identify.toLowerCase() === "admin") {
            const authenticate = await adminModel.findOne({ email: email });
            if (authenticate === null) {
                return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.authenticate });
            }
            const msg = {
                to: email,
                from: 'ishvinder@cronj.com',
                subject: 'Request to change password',
                text: `Your Original Password was ${authenticate.confirmPassword}`,
                html: `<strong>Your Original Password was ${authenticate.confirmPassword}</strong>`,
            };
            sgMail
                .send(msg)
                .then(() => { }, error => {
                    console.error(error);

                    if (error.response) {
                        console.error(error.response.body)
                    }
                });
            return res.send("EMail Send Successfully.")        
        } else {
            return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.query });
        }
    } catch (err) {
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
    }
}

module.exports = { forgotPassword }


