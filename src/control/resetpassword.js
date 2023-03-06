const Investor = require("../models/investor");
const Startup = require("../models/startUp");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const bcrypt = require("bcrypt");
require("dotenv").config();

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error);
  }
};

const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: {
        name: "MakeNewIndia",
        address: "noreply@makenewindia.com",
      },
      to: email,
      subject: `${name}, here's your password reset link`,
      html:
        "<p> Hi " +
        name +
        ', <br><br>  We received a request to reset the password on your MakeNewIndia account.<br> <br> <a href="https://makenewindia.com/reset-password?token=' +
        token +
        '"> Password reset link</a> <br> <br> Click on this link to complete the reset password. After you click the link above, you&#39;ll be prompted to complete the following steps:<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1. Enter new password.<br> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  2. Confirm your new password. <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  3. Hit Submit. <br> <br> <strong> This link is valid for one use only. It will expire in 2 hours. </strong>  <br> <br>  If you didn’t request this password rest or you received this message in error, please disregard this email.<br> <br> Thanks for helping us keep your account secure.<br> <br> The MakeNewIndia Team',
    };

    transport.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log(`Mail has been sent.`, info.response);
      }
    });
  } catch (error) {}
};

const sendResetSuccessMail = async (name, email) => {
  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: {
        name: "MakeNewIndia",
        address: "noreply@makenewindia.com",
      },
      to: email,
      subject: `${name}, your password was successfully reset`,
      html:
        "<p>Hi " +
        name +
        ", <br /> <br /> <h3> <strong>  You&rsquo;ve successfully updated your password. </strong> </h3> <br /> If you don&rsquo;t recognize this action, we recommend you do an additional password reset. If you need assistance, please connect with our support team.<br /> <br />Thank you for using MakeNewIndia! <br /> <br />The MakeNewIndia Team</p>",
    };

    transport.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log(`Mail has been sent.`, info.response);
      }
    });
  } catch (error) {}
};

const forgotPass = async (req, res) => {
  try {
    const email = req.body.email;
    const userDataInvestor = await Investor.findOne({ email: email });
    if (userDataInvestor) {
      const randomString = randomstring.generate();
      const data = await Investor.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendResetPasswordMail(
        userDataInvestor.name,
        userDataInvestor.email,
        randomString
      );
      return res.send(`Mail sent. Please check your inbox.`);
    }
    const userDataStartup = await Startup.findOne({ email: email });
    if (userDataStartup) {
      const randomString = randomstring.generate();
      const data = await Startup.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendResetPasswordMail(
        userDataStartup.companyName,
        userDataStartup.email,
        randomString
      );
      return res.send(`Mail sent. Please check your inbox.`);
    }
    if (!userDataInvestor || userDataStartup)
      return res.status(400).send({ msg: `User doesn't exist` });
  } catch (error) {
    return res.status(500).send({ msg: `Internal Server Error` });
  }
};

const resetPass = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenDataInvestor = await Investor.findOne({ token: token });
    if (tokenDataInvestor) {
      const password = req.body.password;
      const newPassword = await securePassword(password);
      const userData = await Investor.findByIdAndUpdate(
        { _id: tokenDataInvestor._id },
        { $set: { password: newPassword, token: "" } },
        { new: true }
      );
      sendResetSuccessMail(tokenDataInvestor.name, tokenDataInvestor.email);
      return res.send({ msg: `Password has been reset.`, data: userData });
    }

    const tokenDataStartup = await Startup.findOne({ token: token });
    if (tokenDataStartup) {
      const password = req.body.password;
      const newPassword = await securePassword(password);
      const userData = await Startup.findByIdAndUpdate(
        { _id: tokenDataStartup._id },
        { $set: { password: newPassword, token: "" } },
        { new: true }
      );
      sendResetSuccessMail(
        tokenDataStartup.companyName,
        tokenDataStartup.email
      );
      return res.send({ msg: `Password has been reset.`, data: userData });
    }
    if (!tokenDataInvestor || tokenDataStartup)
      return res.status(400).send({ msg: `Token invalid/expired.` });
  } catch (error) {
    return res.status(500).send({ msg: `Internal Server Error` });
  }
};

module.exports = {
  forgotPass,
  resetPass,
};
