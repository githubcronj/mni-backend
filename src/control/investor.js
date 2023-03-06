const investorModel = require("../models/investor");
const { registerValidation, updateValidation } = require("../util/validation");
const CustomErrorHandler = require("../service/CustomErrorHandler");
const { findById } = require("../models/investor");
const startUp = require("../models/startUp");
const investor = require("../models/investor");
const { Router } = require("express");
const s3Upload = require("../service/s3Upload");
const {
  errorMessage,
  statusCodes,
  successMessage,
} = require("../util/utility");

const investorDetails = async (req, res, next) => {
  try {
    const investorId = req.params.investorId;
    const details = await investorModel.find({ uId: investorId });

    if (details.length === 0) return next(CustomErrorHandler.notFound());

    res.status(200).json({ data: details });
  } catch (error) {
    return next(error);
  }
};

const updateInvestor = async (req, res, next) => {
  try {
    let files = req.files;
    const { error } = updateValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const investorId = req.params.investorId;
    if (files.length !== 0) {
      req.body.profilePicture = await s3Upload.uploadFile(files[0]);
    }
    if (req.body.areaOfExpertise) {
      let a = req.body.areaOfExpertise.split(",");
      req.body.areaOfExpertise = a;
    }
    if (req.body.companiesBacked) {
      let a = req.body.companiesBacked.split(",");
      req.body.companiesBacked = a;
    }
    const updatedUser = await investorModel.findOneAndUpdate(
      { uId: investorId },
      req.body,
      { new: true }
    );

    res.json({ msg: `Update Successful`, data: updatedUser });
  } catch (error) {
    //console.log(error);
    return next(error);
  }
};

const deleteInvestor = async (req, res, next) => {
  try {
    let investorId = req.params.id.split(",");

    const data = await investorModel.updateMany(
      { uId: { $in: investorId } },
      { $set: { isDeleted: true } }
    );

    return res.json({ msg: "Investor Deleted Successfully", data: investorId });
  } catch (error) {
    return next(error);
  }
};

const getInvestorList = async (req, res) => {
  try {
    let date = req.query.date;
    let investorData = await investorModel.find({
      isDeleted: false,
      isBlocked: false,
    });
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startindex = (page - 1) * limit;
    const endIndex = page * limit;
    const result = {};
    if (date) {
      result.signUpDate = date;
    }
    if (endIndex < investorData.length) {
      result.next = {
        page: page + 1,
        limit: limit,
      };
    }
    if (startindex > 0) {
      result.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    result.isDeleted = false;
    result.isBlocked = false;
    const investorList = await investorModel
      .find(result)
      .limit(limit)
      .skip(startindex);
    res.json({ status: "OK", data: investorList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const blockInvestor = async (req, res, next) => {
  try {
    let investorId = req.params.id.split(",");

    const block = await investorModel.updateMany(
      { uId: { $in: investorId } },
      { $set: { isBlocked: true } }
    );

    res.json({ msg: "Investor Blocked Successfully", data: investorId });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const unblockInvestor = async (req, res, next) => {
  try {
    let investorId = req.params.id.split(",");

    const unBlock = await investorModel.updateMany(
      { uId: { $in: investorId } },
      { $set: { isBlocked: false } }
    );

    res.json({ msg: "Investor Unblocked Successfully", data: investorId });
  } catch (error) {
    return next(error);
  }
};

const searchInvestor = async (req, res, next) => {
  try {
    const { name, location, industry, page = 1, limit = 10 } = req.query;

    const queryFilter = {};
    queryFilter.isDeleted = false;

    if (name) {
      queryFilter.name = { $regex: name, $options: "i" };
    }

    if (location) {
      queryFilter.location = { $regex: location, $options: "i" };
    }

    if (industry) {
      queryFilter.industry = { $regex: industry, $options: "i" };
    }
    let result = await investorModel
      .find(queryFilter)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    if (result.length === 0) return next(CustomErrorHandler.notFound());
    res.send(result);
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const searchStartup = async (req, res, next) => {
  try {
    const {
      name,
      location,
      askPrice,
      equityOffer,
      sortByAtoZ,
      askPriceSort,
      equityOfferSort,
      sortByNewToOld,
      page = 1,
      limit = 10,
      askPriceLT,
      askPriceGT,
      equityOfferLT,
      equityOfferGT,
    } = req.query;
    const queryFilter = {};
    let sortParam = {};

    queryFilter.isDeleted = false;
    if (name) {
      queryFilter.companyName = { $regex: name, $options: "i" };
    }
    if (location) {
      queryFilter.location = { $regex: location, $options: "i" };
    }
    if (askPrice) {
      queryFilter.askPrice = { $regex: askPrice, $options: "i" };
    }
    if (equityOffer) {
      queryFilter.equityOffer = { $regex: equityOffer };
    }
    if (askPriceGT) {
      queryFilter.askPrice = { $gte: askPriceGT };
    }
    if (askPriceLT) {
      queryFilter.askPrice = { $lte: askPriceLT };
    }
    if (equityOfferGT) {
      queryFilter.equityOffer = { $gte: equityOfferGT };
    }
    if (equityOfferLT) {
      queryFilter.equityOffer = { $lte: equityOfferLT };
    }
    if (askPriceSort === "1" || askPriceSort === "-1") {
      sortParam = { askPrice: askPriceSort };
    }
    if (equityOfferSort === "1" || equityOfferSort === "-1") {
      sortParam = { equityOffer: equityOfferSort };
    }
    if (sortByAtoZ === "1" || sortByAtoZ === "-1") {
      sortParam = { companyName: sortByAtoZ };
    }
    if (sortByNewToOld === "1" || sortByNewToOld === "-1") {
      sortParam = { createdAt: sortByNewToOld };
    }
    const result = await startUp
      .find(queryFilter)
      .sort(sortParam)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    if (result.length === 0) return next(CustomErrorHandler.notFound());
    const finalData = await result;
    res.json({ total: finalData.length, data: finalData });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const getInvestorProfile = async (req, res, next) => {
  try {
    const investorId = req.params.investorId;
    const details = await investorModel.find({ uId: investorId });

    if (details.length === 0) return next(CustomErrorHandler.notFound());

    res.status(200).json({ data: details });
  } catch (error) {
    return next(error);
  }
};

const getTopStartups = async (req, res, next) => {
  try {
    const key = req.query.key;
    const investors = await investorModel.find({ isDeleted: false }).limit(8); //change limit to increse/decrease no. of documents.
    const topRisingStartups = await startUp
      .find()
      .sort({ askPrice: -1 })
      .limit(8);
    const investorCount = await investor.find();
    const startupCount = await startUp.find();

    const susbsCount = 500;
    let result = {
      investor: [...investors],
      startUps: [...topRisingStartups],
      investors: investorCount.length,
      startups: startupCount.length,
      users: investorCount.length + startupCount.length,
      subscriptions: susbsCount,
    };

    if (key === "topStartups") {
      return res.json({ data: topRisingStartups });
    }
    if (key === "investors") {
      return res.json({ data: investors });
    }
    return res.send(result);
  } catch (error) {
    return next(error);
  }
};

const addConnection = async (req, res, next) => {
  try {
    let ids = req.params.Id.split(",");
    let identify = req.query.key;
    if (identify.toLowerCase() === "investor") {
      const connections = await investorModel.updateMany(
        { userId: { $in: ids } },
        { $set: { connections: ids } }
      );
    }
    if (identify.toLowerCase() === "startup") {
      const connections = await startUp.updateMany(
        { userId: { $in: ids } },
        { $set: { connections: ids } }
      );
    }

    res.json({
      msg: "Added Connection Successfully",
      data: [ids],
      connections: [ids].length,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const search = async (req, res, next) => {
  try {
    let key = req.query.key;
    let val = req.query.val;
    if (key.toLowerCase() === "investor") {
      let data = await startUp.find({
        $or: [
          { companyName: { $regex: val, $options: "i" } },
          { location: { $regex: val, $options: "i" } },
        ],
      });
      return res.send(data);
    }

    if (key.toLowerCase() === "startup") {
      let data = await investor.find({
        $or: [
          { name: { $regex: val, $options: "i" } },
          { location: { $regex: val, $options: "i" } },
        ],
      });
      return res.send(data);
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

module.exports = {
  investorDetails,
  updateInvestor,
  deleteInvestor,
  getInvestorList,
  blockInvestor,
  unblockInvestor,
  searchInvestor,
  searchStartup,
  getInvestorProfile,
  getTopStartups,
  addConnection,
  search,
};
