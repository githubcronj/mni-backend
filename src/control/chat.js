const chatModel = require("../models/chat");
const {
  statusCodes,
  successMessage,
  errorMessage,
} = require("../util/utility");
const moment = require("moment");
const { sendChatMail } = require("../util/SendEmail");
const investor = require("../models/investor");
const startUp = require("../models/startUp");

const createMessage = async function (req, res) {
  let { from, to, msg } = req.body;
  var check = await chatModel.findOne({
    $and: [{ to: { $in: [from, to] } }, { from: { $in: [from, to] } }],
  });
  if (check === null) {
    req.body.msg = {
      senderInfo: from,
      recieverInfo: to,
      date: moment().format("MMMM Do YYYY, h:mm:ss a"),
      content: msg,
    };
    const saveData = await chatModel.create(req.body);
    const findInvestor = await investor.findOne({ uId: to });
    const findstartup = await startUp.findOne({ userId: from });
    if (findInvestor !== null && findstartup !== null) {
      sendChatMail(
        findInvestor.name,
        findInvestor.email,
        findstartup.companyName
      );
    } else {
      const findInvestor = await investor.findOne({ uId: from });
      const findstartup = await startUp.findOne({ userId: to });
      sendChatMail(
        findstartup.companyName,
        findstartup.email,
        findInvestor.name
      );
    }
    return res.status(statusCodes[201].value).send({
      status: statusCodes[201].message,
      message1: successMessage.chat,
      message2: successMessage.Delievered,
      data: saveData,
      comingFrom: "if blockk",
    });
  } else {
    var chatObject = {
      senderInfo: from,
      recieverInfo: to,
      date: moment().format("MMMM Do YYYY, h:mm:ss a"),
      content: msg,
    };
    check.msg.push(chatObject);
    check.save();
    const findInvestor = await investor.findOne({ uId: to });
    const findstartup = await startUp.findOne({ userId: from });
    if (findInvestor !== null && findstartup !== null) {
      sendChatMail(
        findInvestor.name,
        findInvestor.email,
        findstartup.companyName
      );
    } else {
      const findInvestor = await investor.findOne({ uId: from });
      const findstartup = await startUp.findOne({ userId: to });
      sendChatMail(
        findstartup.companyName,
        findstartup.email,
        findInvestor.name
      );
    }
  }

  return res.status(statusCodes[200].value).send({
    status: statusCodes[200].message,
    message: successMessage.Delievered,
    comingFrom: "else block",
    data: check,
  });
};
//{ $or: [{ from: from }, { to: to }] }
const getMessage = async function (req, res) {
  let from = req.params.from;
  let to = req.params.to;
  const findMessages = await chatModel
    .findOne({
      $and: [{ to: { $in: [from, to] } }, { from: { $in: [from, to] } }],
    })
    .select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });
  if (findMessages === null) {
    return res.status(statusCodes[400].value).send({
      status: statusCodes[400].message,
      message: errorMessage.notFound,
    });
  }
  return res.status(statusCodes[200].value).send({
    status: statusCodes[200].message,
    message: successMessage.success,
    data: findMessages,
  });
};

const recentChats = async (req, res, next) => {
  try {
    let id = req.params.id;
    const data = await chatModel
      .find({ $or: [{ from: id }, { to: id }] })
      .select({ msg: 0 });
    let filterData = [];
    for (let i = 0; i < data.length; i++) {
      let to = data[i].to;
      let from = data[i].from;
      const checkDataS = await startUp.findOne({
        $or: [{ userId: to }],
      });
      const checkDataI = await investor.findOne({
        $or: [{ uId: from }],
      });
      if (checkDataS !== null && checkDataI !== null) {
        filterData.push(data[i]);
      }
    }
   return res.status(statusCodes[200].value).send(filterData);
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

module.exports = {
  createMessage,
  getMessage,
  recentChats,
};
