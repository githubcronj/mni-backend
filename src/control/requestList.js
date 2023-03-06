const requestListModel = require("../models/requestList");
const investor = require("../models/investor");
const startup = require("../models/startUp");
const {
  statusCodes,
  successMessage,
  errorMessage,
} = require("../util/utility");
const startUp = require("../models/startUp");
const moment = require("moment");
const SendEmail = require("../util/SendEmail");
// const { hasClicked } = require('../service/service');
const { v4: uuidV4, v5: uuidV5, validate: uuidValidate } = require("uuid");

const sendRequest = async (req, res) => {
  try {
    let to = req.params.id1;
    let from = req.params.id2;
    let identify = req.query.key;
    let { note } = req.body;
    if (identify.toLowerCase() === "startup") {
      var startupFind = await startup.findOne({ userId: from });
      var find = await investor.findOne({ uId: to });
      let checkUnique = await investor.findOne({
        $and: [
          { uId: to },
          {
            $or: [
              { connections: { $eq: from } },
              { "connectionRequest.requestComingFrom": from },
            ],
          },
        ],
      });
      if (checkUnique !== null) {
        return res.status(statusCodes[406].value).send({
          status: statusCodes[406].message,
          message: errorMessage.unique,
        });
      }
      let infoObject = {
        requestComingFrom: from,
        note: note,
        status: "pending",
        type: identify,
      };
      let notifyObj = {
        uId: uuidV4(),
        userId: from,
        message: `${startupFind.companyName} has requested to connect`,
        isRead: false,
        date: moment().format("MMMM Do YYYY, h:mm:ss a"),
      };
      find.connectionRequest.push(infoObject);
      find.notification.push(notifyObj);
      find.save();
      SendEmail.sendConnectionMail(
        find.name,
        find.email,
        startupFind.companyName
      );
    } else if (identify.toLowerCase() === "investor") {
      var find = await startup.findOne({ userId: to });
      var investorFind = await investor.findOne({ uId: from });
      let checkUnique = await startup.findOne({
        $and: [
          { userId: to },
          {
            $or: [
              { connections: { $eq: from } },
              { "connectionRequest.requestComingFrom": from },
            ],
          },
        ],
      });
      if (checkUnique !== null) {
        return res.status(statusCodes[406].value).send({
          status: statusCodes[406].message,
          message: errorMessage.unique,
        });
      }
      let infoObject = {
        requestComingFrom: from,
        note: note,
        status: "pending",
        date: moment().format("MMMM Do YYYY, h:mm:ss a"),
        type: identify,
      };
      let notifyObj = {
        uId: uuidV4(),
        userId: from,
        message: `${investorFind.name} has requested to connect`,
        isRead: false,
        date: moment().format("MMMM Do YYYY, h:mm:ss a"),
      };
      find.connectionRequest.push(infoObject);
      find.notification.push(notifyObj);
      find.save();
      SendEmail.sendConnectionMail(
        find.companyName,
        find.email,
        investorFind.name 
      );
    } else {
      return res.status(statusCodes[400].value).send({
        status: statusCodes[400].message,
        message: errorMessage.query,
      });
    }
    return res.status(statusCodes[201].value).send({
      status: statusCodes[201].message,
      message: successMessage.success,
      data: find,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(statusCodes[500].value)
      .send({ status: statusCodes[500].message, message: err.message });
  }
};

const getRequestList = async (req, res) => {
  try {
    let id = req.params.Id;
    let identify = req.query.key;
    if (identify.toLowerCase() === "investor") {
      var findUser = await investor
        .findOne({ uId: id })
        .select({ connectionRequest: 1, _id: 0 });
      return res.status(statusCodes[200].value).send({
        status: statusCodes[200].message,
        message: successMessage.success,
        data: findUser,
      });
    }
    if (identify.toLowerCase() === "startup") {
      var findUser = await startup
        .findOne({ userId: id })
        .select({ connectionRequest: 1, _id: 0 });
      return res.status(statusCodes[200].value).send({
        status: statusCodes[200].message,
        message: successMessage.success,
        data: findUser,
      });
    }
  } catch (err) {
    return res
      .status(statusCodes[500].value)
      .send({ status: statusCodes[500].message, message: err.message });
  }
};

const acceptOrRejectRequest = async (req, res) => {
  try {
    let identify = req.query.key;
    const state = req.query.state;
    let id = req.params.Id;
    let requestId = req.params.Id2;
    if (identify.toLowerCase() === "investor") {
      let findUser = await investor.findOne({ uId: id });
      let findStartup = await startUp.findOne({ userId: requestId });
      let checkUnique = await investor.findOne({
        $and: [{ uId: id }, { connections: { $eq: requestId } }],
      });
      if (checkUnique !== null) {
        return res.status(statusCodes[406].value).send({
          status: statusCodes[406].message,
          message: errorMessage.unique,
        });
      } else {
        const update = await investor.updateOne(
          { uId: id, "connectionRequest.requestComingFrom": requestId },
          { $set: { "connectionRequest.$.status": state } }
        );
        console.log(update);
        if (update.matchedCount !== 0) {
          if (state.toLowerCase() === "accept") {
            let notifyObj = {
              uId: uuidV4(),
              userId: id,
              message: `${findUser.name} has accepted your Connection Request`,
              isRead: false,
              date: moment().format("MMMM Do YYYY, h:mm:ss a"),
            };
            findStartup.notification.push(notifyObj);
            findStartup.connections.push(id);
            findUser.connections.push(requestId);
          }
        } else {
          return res.status(statusCodes[404].value).send({
            status: statusCodes[404].message,
            message: errorMessage.notFound,
          });
        }
        findStartup.save();
        findUser.save();
        return res.status(statusCodes[200].value).send({
          status: statusCodes[200].message,
          message: successMessage.success,
          data1: findUser,
          data2: findStartup,
        });
      }
    }
    if (identify.toLowerCase() === "startup") {
      let findStartup = await startup.findOne({ userId: id });
      let findInvestor = await investor.findOne({ uId: requestId });
      let checkUnique = await startup.findOne({
        $and: [{ userId: id }, { connections: { $eq: requestId } }],
      });
      if (checkUnique !== null) {
        return res.status(statusCodes[406].value).send({
          status: statusCodes[406].message,
          message: errorMessage.unique,
        });
      } else {
        const update = await startup.updateOne(
          { userId: id, "connectionRequest.requestComingFrom": requestId },
          { $set: { "connectionRequest.$.status": state } }
        );
        if (update.matchedCount !== 0) {
          if (state.toLowerCase() === "accept") {
            let notifyObj = {
              uId: uuidV4(),
              userId: id,
              message: `${findStartup.companyName} has accepted your Connection Request`,
              isRead: false,
              date: moment().format("MMMM Do YYYY, h:mm:ss a"),
            };
            findInvestor.notification.push(notifyObj);
            findInvestor.connections.push(id);
            findStartup.connections.push(requestId);
          }
        }
        findInvestor.save();
        findStartup.save();
        return res.status(statusCodes[200].value).send({
          status: statusCodes[200].message,
          message: successMessage.success,
          data: findStartup,
          data2: findInvestor,
        });
      }
    }
  } catch (err) {
    return res
      .status(statusCodes[500].value)
      .send({ status: statusCodes[500].message, message: err.message });
  }
};

const updateNotification = async (req, res) => {
  try {
    let identify = req.query.key;
    let id = req.params.Id;
    let notifId = req.params.notifId;
    if (identify.toLowerCase() === "startup") {
      const update = await startup.updateOne(
        { userId: id, "notification.uId": notifId },
        { $set: { "notification.$.isRead": true } }
      );
      if (update.matchedCount === 0) {
        return res.status(statusCodes[404].value).send({
          status: statusCodes[404].message,
          message: errorMessage.notFound,
        });
      } else {
        return res.status(statusCodes[200].value).send({
          status: statusCodes[200].message,
          message: successMessage.success,
        });
      }
    }
    if (identify.toLowerCase() === "investor") {
      const update = await investor.updateOne(
        { uId: id, "notification.uId": notifId },
        { $set: { "notification.$.isRead": true } }
      );
      if (update.matchedCount === 0) {
        return res.status(statusCodes[404].value).send({
          status: statusCodes[404].message,
          message: errorMessage.notFound,
        });
      } else {
        return res.status(statusCodes[200].value).send({
          status: statusCodes[200].message,
          message: successMessage.success,
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(statusCodes[500].value)
      .send({ status: statusCodes[500].message, message: err.message });
  }
};

const getNotification = async (req, res) => {
  try {
    let identify = req.query.key;
    let id = req.params.Id;
    if (identify.toLowerCase() === "investor") {
      let findData = await investor.findOne({ uId: id }); //"notification.isRead":false
      if (findData === null) {
        return res.status(statusCodes[404].value).send({
          status: statusCodes[404].message,
          message: errorMessage.notFound,
        });
      } else {
        let showData = [];
        for (let i = 0; i < findData.notification.length; i++) {
          if (findData.notification[i].isRead === false) {
            showData.push(findData.notification[i]);
          }
        }
        return res.status(statusCodes[200].value).send({
          status: statusCodes[200].message,
          message: successMessage.success,
          data: showData,
        });
      }
    } else if (identify.toLowerCase() === "startup") {
      let findData = await startup.findOne({ userId: id }); //"notification.isRead":false
      if (findData === null) {
        return res.status(statusCodes[404].value).send({
          status: statusCodes[404].message,
          message: errorMessage.notFound,
        });
      } else {
        let showData = [];
        for (let i = 0; i < findData.notification.length; i++) {
          if (findData.notification[i].isRead === false) {
            showData.push(findData.notification[i]);
          }
        }
        return res.status(statusCodes[200].value).send({
          status: statusCodes[200].message,
          message: successMessage.success,
          data: showData,
        });
      }
    } else {
      return res.status(statusCodes[400].value).send({
        status: statusCodes[400].message,
        message: errorMessage.query,
      });
    }
  } catch (err) {
    return res
      .status(statusCodes[500].value)
      .send({ status: statusCodes[500].message, message: err.message });
  }
};

const getConnections = async (req, res) => {
  let identify = req.query.key;
  let id = req.params.Id;
  if (identify.toLowerCase() === "investor") {
    let findData = await investor
      .findOne({ uId: id })
      .select({ connections: 1, _id: 0 });
    res.send(findData);
  }
};

const removeConnection = async (req, res, next) => {
  try {
    let id1 = req.params.id1; //deleteing from (self)
    let id2 = req.params.id2; //to be deleted
    let identify = req.query.key;
    if (identify.toLowerCase() === "investor") {
      const data = await investor.findOneAndUpdate(
        { $and: [{ userId: id1 }, { connections: id2 }] },
        { $pull: { connections: { $eq: id2 } } },
        { new: true }
      );
      if (data === null) {
        return res
          .status(statusCodes[404].value)
          .send({ status: statusCodes[404].message });
      } else {
        var updateStartup = await startUp.findOneAndUpdate(
          { userId: id2 },
          { $pull: { connections: { $eq: id1 } } },
          { new: true }
        );
      }
      return res.status(statusCodes[200].value).send({
        status: statusCodes[200].message,
        data: data,
        corresopndingData: updateStartup,
      });
    }
    if (identify.toLowerCase() === "startup") {
      const data = await startUp.findOneAndUpdate(
        { $and: [{ userId: id1 }, { connections: id2 }] },
        { $pull: { connections: { $eq: id2 } } },
        { new: true }
      );
      if (data === null) {
        return res
          .status(statusCodes[404].value)
          .send({ status: statusCodes[404].message });
      } else {
        var updateInvestor = await investor
          .findOneAndUpdate(
            { userId: id2 },
            { $pull: { connections: { $eq: id1 } } },
            { new: true }
          )
          .select({ connections: 1 });
      }
      return res.status(statusCodes[200].value).send({
        status: statusCodes[200].message,
        data: data,
        correspondingData: updateInvestor,
      });
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

module.exports = {
  sendRequest,
  getRequestList,
  acceptOrRejectRequest,
  getNotification,
  updateNotification,
  getConnections,
  removeConnection,
};
