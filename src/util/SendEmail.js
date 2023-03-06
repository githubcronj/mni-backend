const nodemailer = require("nodemailer");
require("dotenv").config();

const sendStartupRegisterMail = async (name, email) => {
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
      subject: `${name}, Welcome to our online business community`,
      html:
        "<p>Hi " +
        name +
        ",<br /> <br /> Thank you for joining our new website makenewindia.com and becoming part of our business<br />community! We are very excited to have you here and hope you stay around as we grow, providing lots<br />of opportunities to meet great people.<br /> <br /> We are on a mission to inspire Indians around the world. <br /><br />The site is new, and we are still working on developing it, but we hope you will find what you are looking<br />for. Our members are the very reason this site is able to grow and flourish, so it is with great pleasure<br />that we welcome you to our online home.<br /> <br /> What can you do our platform?<br /> <ul>  <li> Upload your pitch. </li> <li> Search Investors by Name, Industry or Location.</li> <li> Connect with Investors. </li> <li> Chat with Investors.</li> <li> Grow your Business Network </li> <br /> </ul>Jump in and make yourself at home! Thank you for using MakeNewIndia! <br /> <p>Regards,<br />Team MakeNewIndia</p>",
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
const sendInvestorRegisterMail = async (name, email) => {
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
      subject: `${name}, Welcome to our online business community`,
      html:
        "<p>Hi " +
        name +
        ",<br /> <br /> Thank you for joining our new website makenewindia.com and becoming part of our business<br />community! We are very excited to have you here and hope you stick around as we grow, providing lots<br />of opportunities to meet great people.<br /> <br /> We are on a mission to inspire Indians around the world.<br /> <br /> The site is new, and we are still working on developing it, but we hope you will find what you are looking<br />for. Our members are the very reason this site is able to grow and flourish, so it is with great pleasure<br />that we welcome you to our online home.<br /> <br />What can you do on our platform?<br /> <ul> <li> Search businesses by Name, Industry or Location </li> <li> Connect with founders.</li> <li> Chat with founders.</li> <li> Grow your Business Network </li> </ul>  Jump in and make yourself at home! Thank you for using MakeNewIndia!</p> <p>Regards,<br />Team MakeNewIndia</p>",
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
const sendConnectionMail = async (name, email, from) => {
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
      subject: `${name}, Connection request`,
      html:
        "<p>Hi " +
        name +
        ",<br />You have a connection request from " +
        from +
        " </p>",
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

const sendChatMail = async (name, email, from) => {
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
      subject: `${name}, You have a message from ${from}`,
      html:
        "<p>Hi " + name + ",<br />You have a Message from " + from + " </p>",
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

const sendSupportMail = async (name, email, subject, description) => {
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
      from: email,
      to: "support@makenewindia.com",
      subject: subject,
      html:
        "<p>Hi " +
        name +
        `,<br />${description} ` +
        "<br>" +
        `${email}` +
        " </p>",
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

const sendSupportMailSuccess = async (name, email) => {
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
      subject: `${name}, We've received your support ticket`,
      html:
        "<p>Hi " +
        name +
        ",<br />Thank you for contacting us. We&amp;#39;ve received your support ticket.<br />Your issue has been logged and a representative will be with you shortly!<br />Rest assured we&amp;#39;ll get back to you as soon as possible.<br />Please do not reply to this email, it isn&amp;#39;t monitored, and replies aren&amp;#39;t taken.</p><p>Regards,<br /><p>Regards,<br />Team MakeNewIndia</p>",
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

module.exports = {
  sendInvestorRegisterMail,
  sendStartupRegisterMail,
  sendConnectionMail,
  sendChatMail,
  sendSupportMail,
  sendSupportMailSuccess,
};
