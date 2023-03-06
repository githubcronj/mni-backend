const adminModel = require("../models/admin");
const investorModel = require("../models/investor");
const startUpModel = require("../models/startUp");
const s3Upload = require('../service/s3Upload');
const SendMail = require('../util/SendEmail');
const {
  isEmptyBody,
  isValidPassword,
  isValidEmail,
  isValidPhone,
  isValidName,
  isLoggedIn,
  isDecryptPassword,
  isPresent,
  hasEncryptPassword,
  hasClicked,
  checkExpiration,
} = require("../service/service");
const bcrypt = require("bcrypt");
const {
  errorMessage,
  successMessage,
  statusCodes,
  tokenGeneration,
} = require("../util/utility");
const { default: mongoose } = require("mongoose");
// const ObjectId = mongoose.Types.ObjectId;
// const crypto = require("crypto");
const { v4: uuidV4, v5: uuidV5, validate: uuidValidate } = require("uuid");

const register = async function (req, res) {
  try {
    let data = req.body;
    let identify = req.query;
    var originalPassword = data.password;
    if (isEmptyBody(data)) {
      return res
        .status(statusCodes[400].value)
        .send({
          status: statusCodes[400].message,
          message: errorMessage.emptyBody,
        });
    }
    if (identify.key.toLowerCase() === "admin") {
      if (!isPresent(data.name)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.nameRequired,
          });
      }
      if (!isValidName(data.name)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.name,
          });
      }
      if (!isPresent(data.email)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.emailRequired,
          });
      }
      if (!isValidEmail(data.email)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.email,
          });
      } else {
        let checkUnique = await adminModel.find({ $and: [{ email: data.email }, { isDeleted: false }] });
        if (checkUnique.length !== 0) {
          return res
            .status(statusCodes[400].value)
            .send({
              status: statusCodes[400].message,
              message: errorMessage.emailUnique,
            });
        }
      }
      if (!isPresent(data.password)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.passwordRequired,
          });
      }
      if (!isPresent(data.confirmPassword)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.passwordRequired,
          });
      }
      if (!isValidPassword(data.password, data.confirmPassword)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.password,
          });
      } else {
        // hasEncryptPassword(data.password,data.confirmPassword);
        const encryptPassword = await bcrypt.hash(data.password, 10);
        data.password = encryptPassword;
      }
      if (!isPresent(data.phoneNumber)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.phoneRequired,
          });
      }
      if (!isValidPhone(data.phoneNumber)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.phone,
          });
      } else {
        let checkUnique = await adminModel.findOne({
          phoneNumber: data.phoneNumber,
        });
        if (checkUnique !== null) {
          return res
            .status(statusCodes[400].value)
            .send({
              status: statusCodes[400].message,
              message: errorMessage.phoneUnique,
            });
        }
      }
      const id = uuidV4();
      if (uuidValidate(id)) {
        data.userId = id;
      }

      let savedData = await adminModel.create(data);
      if (savedData) {
        let authenticate = await adminModel.findOne({
          $or: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
        });
        if (authenticate) {
          if (!isDecryptPassword(originalPassword, savedData.password)) {
            return res
              .status(statusCodes[400].value)
              .send({
                status: statusCodes[400].message,
                message: errorMessage.password,
              });
          }
          let payload = { userId: savedData._id };
          const token = isLoggedIn(payload, tokenGeneration.key, {
            expiresIn: tokenGeneration.time,
          });
          if (token) {
            return res
              .status(statusCodes[200].value)
              .send({
                status: statusCodes[200].message,
                message: successMessage.login,
                tokenData: token,
              });
          }
        } else {
          return res
            .status(statusCodes[400].value)
            .send({
              status: statusCodes[400].message,
              message: errorMessage.authenticate,
            });
        }
      }
    } else if (identify.key.toLowerCase() == "startup") {
      const alreadyExists = await investorModel.findOne({ email: req.body.email });
      if (alreadyExists !== null) {
        return res.status(400).send(`email alredy registered.`)
      }
      if (!isPresent(data.companyName)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.nameRequired,
          });
      }
      if (!isValidName(data.companyName)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.name,
          });
      }
      if (!isPresent(data.email)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.emailRequired,
          });
      }
      if (!isValidEmail(data.email)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.email,
          });
      } else {
        let checkUnique = await startUpModel.find({ $and: [{ email: data.email }, { isActive: true }] });
        if (checkUnique.length !== 0) {
          return res
            .status(statusCodes[400].value)
            .send({
              status: statusCodes[400].message,
              message: errorMessage.emailUnique,
            });
        }
      }
      if (!isPresent(data.password)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.passwordRequired,
          });
      }
      if (!isPresent(data.confirmPassword)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.passwordRequired,
          });
      }
      if (!isValidPassword(data.password, data.confirmPassword)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.password,
          });
      } else {
        const encryptPassword = await bcrypt.hash(data.password, 10);
        data.password = encryptPassword;
      }
      if (isPresent(data.phone)) {
        if (!isValidPhone(data.phoneNumber)) {
          return res
            .status(statusCodes[400].value)
            .send({
              status: statusCodes[400].message,
              message: errorMessage.phone,
            });
        } else {
          let checkUnique = await startUpModel.findOne({
            phoneNumber: data.phoneNumber,
          });
          if (checkUnique !== null) {
            return res
              .status(statusCodes[400].value)
              .send({
                status: statusCodes[400].message,
                message: errorMessage.phoneUnique,
              });
          }
        }
      }
      if (!isPresent(data.industry)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.industryRequired,
          });
      }
      if (!isPresent(data.location)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.locationRequired,
          });
      }
      if (!isPresent(data.founded)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.foundedRequired,
          });
      }
      if (!isPresent(data.equityOffer)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.equityRequired,
          });
      }
      if (!isPresent(data.askPrice)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.askPriceRequired,
          });
      }
      if (!isPresent(data.companyInfo)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.companyInfo,
          });
      }
      // data.userId = crypto.randomUUID();
      const id = uuidV4();
      if (uuidValidate(id)) {
        data.userId = id;
      }

      let savedData = await startUpModel.create(data);
      if (savedData) {
        let authenticate = await startUpModel.findOne({
          $or: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
        });
        if (authenticate) {
          if (!isDecryptPassword(originalPassword, savedData.password)) {
            return res
              .status(statusCodes[400].value)
              .send({
                status: statusCodes[400].message,
                message: errorMessage.password,
              });
          }
          let payload = { userId: savedData._id };
          const token = isLoggedIn(payload, tokenGeneration.key, {
            expiresIn: tokenGeneration.time,
          });
          if (token) {
            SendMail.sendStartupRegisterMail(data.companyName, data.email);
            return res
              .status(statusCodes[200].value)
              .send({
                status: statusCodes[200].message,
                message: successMessage.login,
                tokenData: token,
                data: savedData,
                type: req.query.key

              });
          }
        } else {
          return res
            .status(statusCodes[400].value)
            .send({
              status: statusCodes[400].message,
              message: errorMessage.authenticate,
            });
        }
      }
    } else if (identify.key.toLowerCase() == "investor") {
      const alreadyExists = await startUpModel.findOne({ email: req.body.email });
      if (alreadyExists !== null) {
        return res.status(400).send(`email alredy registered.`)
      }
      if (!isPresent(data.name)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.nameRequired,
          });
      }
      if (!isValidName(data.name)) {
        res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.name,
          });
      }
      if (!isPresent(data.email)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.emailRequired,
          });
      }
      if (!isValidEmail(data.email)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.email,
          });
      } else {
        let checkUnique = await investorModel.find({ $and: [{ email: data.email }, { isDeleted: false }] });
        if (checkUnique.length !== 0) {
          return res
            .status(statusCodes[400].value)
            .send({
              status: statusCodes[400].message,
              message: errorMessage.emailUnique,
            });
        }
      }
      if (!isPresent(data.age)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.age,
          });
      }
      if (!isPresent(data.password)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.passwordRequired,
          });
      }
      if (!isPresent(data.confirmPassword)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.passwordRequired,
          });
      }
      if (!isValidPassword(data.password, data.confirmPassword)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.password,
          });
      } else {
        const encryptPassword = await bcrypt.hash(data.password, 10);
        data.password = encryptPassword;
      }
      const id = uuidV4();
      if (uuidValidate(id)) {
        data.uId = id;
      }

      if (!isPresent(data.location)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.locationRequired,
          });
      }
      let savedData = await investorModel.create(data);
      if (savedData) {
        let authenticate = await investorModel.findOne({
          $or: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
        });
        if (authenticate) {
          if (!isDecryptPassword(originalPassword, savedData.password)) {
            return res
              .status(statusCodes[400].value)
              .send({
                status: statusCodes[400].message,
                message: errorMessage.password,
              });
          }
          let payload = { userId: savedData._id };
          const token = isLoggedIn(payload, tokenGeneration.key, {
            expiresIn: tokenGeneration.time,
          });
          if (token) {
            SendMail.sendInvestorRegisterMail(data.name, data.email);
            return res
              .status(statusCodes[200].value)
              .send({
                status: statusCodes[200].message,
                message: successMessage.login,
                tokenData: token,
                savedData,
                type: identify
              });
          }
        } else {
          return res
            .status(statusCodes[400].value)
            .send({
              status: statusCodes[400].message,
              message: errorMessage.authenticate,
            });
        }
      }
    } else {
      return res
        .status(statusCodes[400].value)
        .send({
          status: statusCodes[400].message,
          message: errorMessage.query,
        });
    }
  } catch (err) {
    console.error(err)
    return res
      .status(statusCodes[500].value)
      .send({ status: statusCodes[500].message, message: err.message });
  }
};

const login = async function (req, res) {
  try {
    let data = req.body;
    if (isPresent(data.email)) {
      if (!isValidEmail(data.email)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.invalidLogin,
          });
      }
    } else if (isPresent(data.phoneNumber)) {
      if (!isValidPhone(data.phoneNumber)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.phone,
          });
      }
    } else {
      return res
        .status(statusCodes[400].value)
        .send({
          status: statusCodes[400].message,
          message: errorMessage.invalidLogin,
        });
    }
    if (!isPresent(data.password)) {
      return res
        .status(statusCodes[400].value)
        .send({
          status: statusCodes[400].message,
          message: errorMessage.passwordRequired,
        });
    }
    if (req.query.key.toLowerCase() === "startup") {
      var authenticate = await startUpModel.findOne({
        $or: [{ email: data.email.toLowerCase() }],
      });
      if(authenticate === null){
        return res
        .status(statusCodes[400].value)
        .send({
          status: statusCodes[400].message,
          message: errorMessage.authenticate,
        });
      }
      if (authenticate.subscription === "premium") {
        const checkSubscriptionExpiry = checkExpiration(authenticate.paymentDetails.subscriptionExpiry);
        if (checkSubscriptionExpiry == 0) {
          authenticate.subscription = "basic";
          authenticate.save();
        }
      }
    } else if (req.query.key.toLowerCase() === "investor") {
      var authenticate = await investorModel.findOne({
        $or: [{ email: data.email.toLowerCase() }],
      });
      if(authenticate === null){
        return res
        .status(statusCodes[400].value)
        .send({
          status: statusCodes[400].message,
          message: errorMessage.authenticate,
        });
      }
      if (authenticate.subscription === "premium") {
        const checkSubscriptionExpiry = checkExpiration(authenticate.paymentDetails.subscriptionExpiry);
        if (checkSubscriptionExpiry == 0) {
          authenticate.subscription = "basic";
          authenticate.save();
        }
      }
    } else if (req.query.key.toLowerCase() === "admin") {
      var authenticate = await adminModel.findOne({
        $or: [{ email: data.email.toLowerCase() }],
      });
      if(authenticate === null){
        return res
        .status(statusCodes[400].value)
        .send({
          status: statusCodes[400].message,
          message: errorMessage.authenticate,
        });
      }
    } else {
      return res
        .status(statusCodes[400].value)
        .send({ status: statusCodes[400].value, message: errorMessage.query });
    }
    if (authenticate) {
      // console.log(isDecryptPassword(data.password,authenticate.password));
      if (!isDecryptPassword(data.password, authenticate.password)) {
        return res
          .status(statusCodes[400].value)
          .send({
            status: statusCodes[400].message,
            message: errorMessage.password,
          });
      }
      let payload = { userId: authenticate._id };
      const token = isLoggedIn(payload, tokenGeneration.key, {
        expiresIn: tokenGeneration.time,
      });
      if (token) {
        return res
          .status(statusCodes[200].value)
          .send({
            status: statusCodes[200].message,
            message: successMessage.login,
            tokenData: token,
            data: authenticate,
            type: req.query.key
          });
      }
    } else {
      return res
        .status(statusCodes[400].value)
        .send({
          status: statusCodes[400].message,
          message: errorMessage.authenticate,
        });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(statusCodes[500].value)
      .send({ status: statusCodes[500].message });
  }
};

const changePassword = async function (req, res) {
  try {
    let { newPassword, confirmPassword } = req.body;
    let Id = req.params.Id;
    let identity = req.query;
    if (identity.key.toLowerCase() === "investor") {
      let authenticate = await investorModel.findOne({ $and: [{ uId: Id }] }).select({ __v: 0, createdAt: 0, updatedAt: 0 });
      console.log(authenticate)
      if (authenticate === null) {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.authenticate });
      } else {
        if (isValidPassword(newPassword, confirmPassword)) {
          if (isDecryptPassword(newPassword, authenticate.password)) {
            return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.uniquePassword });
          }
          authenticate.password = await bcrypt.hash(newPassword, 10);
          authenticate.confirmPassword = confirmPassword;
        } else {
          return res.status(statusCodes[400].value).send({ status: statusCodes[400].value, message: errorMessage.password });
        }
        authenticate.save();
        return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.update, data: authenticate });
      }
    }
    else if (identity.key.toLowerCase() === "startup") {
      let authenticate = await startUpModel.findOne({ $and: [{ userId: Id }] }).select({ __v: 0, createdAt: 0, updatedAt: 0 });
      if (authenticate === null) {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.authenticate });
      } else {
        if (isValidPassword(newPassword, confirmPassword)) {
          if (isDecryptPassword(newPassword, authenticate.password)) {
            return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.uniquePassword });
          }
          authenticate.password = await bcrypt.hash(newPassword, 10);
          authenticate.confirmPassword = confirmPassword;
        } else {
          return res.status(statusCodes[400].value).send({ status: statusCodes[400].value, message: errorMessage.password });
        }
        authenticate.save();
        return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.update, data: authenticate });
      }
    }
    else if (identity.key.toLowerCase() === "admin") {
      let authenticate = await adminModel.findOne({ $and: [{ userId: Id }] }).select({ __v: 0, createdAt: 0, updatedAt: 0 });
      if (authenticate === null) {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.authenticate });
      } else {
        if (isValidPassword(newPassword, confirmPassword)) {
          if (isDecryptPassword(newPassword, authenticate.password)) {
            return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.uniquePassword });
          }
          authenticate.password = await bcrypt.hash(newPassword, 10);
          authenticate.confirmPassword = confirmPassword;
        } else {
          return res.status(statusCodes[400].value).send({ status: statusCodes[400].value, message: errorMessage.password });
        }
        authenticate.save();
        return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.update, data: authenticate });
      }
    }
    else {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.query });
    }
  } catch (err) {
    return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
  }
}

module.exports = { register, login, changePassword };
