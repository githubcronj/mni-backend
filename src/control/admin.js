const { find } = require("../models/admin");
const adminModel = require("../models/admin");
const blogModel = require('../models/blog');
const testimonialModel = require("../models/testimonial");
const StartupPricing = require('../models/startup-pricing');
const InvestorPricing = require('../models/investor-pricing');
const { createStartupPlanValidation, createInvestorPlanValidation } = require('../util/validation');
const investor = require("../models/investor");
const startUp = require("../models/startUp");
const bcrypt = require("bcrypt");

const {
  errorMessage,
  successMessage,
  statusCodes,
  limit,
} = require("../util/utility");
const { isEmptyBody, isPresent, isValidName, isValidPosition, isValidEmail, hasEncryptPassword, updatePasswordValid, isDecryptPassword, getErrorField, isValidPassword, countDashboard } = require("../service/service");
const { v4: uuidV4, v5: uuidV5, validate: uuidValidate } = require("uuid");
const supportFormModel = require("../models/supportForm");
const admin = require("../models/admin");
const s3Upload = require('../service/s3Upload');

const getAdminProfile = async function (req, res) {
  try {
    let adminId = req.query.id;
    let data = await adminModel.findOne({ userId: adminId }).select({
      _id: 0,
      password: 0,
      confirmPassword: 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0,
    });
    if (data) {
      return res.status(statusCodes[200].value).send({
        status: statusCodes[200].message,
        message: successMessage.success,
        data: data,
      });
    } else {
      return res.status(statusCodes[400].value).send({
        status: statusCodes[400].message,
        message: errorMessage.notFound,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
  }
};

const updateProfileAdmin = async function (req, res) {
  try {
    let adminId = req.query.id;
    let dataToUpdate = req.body;
    let files = req.files;
    if (files.length !== 0) {
      dataToUpdate.profilePicture = await s3Upload.uploadFile(files[0]);
    }
    let findProfile = await adminModel.findOne({ userId: adminId });
    if (!findProfile) {
      return res.status(statusCodes[400].value).send({
        status: statusCodes[400].message,
        message: errorMessage.notFound,
      });
    }
    if (isEmptyBody(dataToUpdate)) {
      return res.status(statusCodes[400].value).send({
        status: statusCodes[400].message,
        message: errorMessage.emptyBody,
      });
    }
    if (dataToUpdate.name) {
      if (isPresent(dataToUpdate.name)) {
        if (isValidName(dataToUpdate.name)) {
          findProfile.name = dataToUpdate.name;
        }
      } else {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.nameRequired });
      }
    }
    if (dataToUpdate.email) {
      if (isPresent(dataToUpdate.email)) {
        if (isValidEmail(dataToUpdate.email)) {
          findProfile.email = dataToUpdate.email;
        }
      } else {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.emailRequired });
      }
    }
    if (dataToUpdate.password) {
      if (isPresent(dataToUpdate.password)) {
        if (updatePasswordValid(dataToUpdate.password)) {
          if (isDecryptPassword(dataToUpdate.password, findProfile.password)) {
            return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.uniquePassword });
          }
          findProfile.password = hasEncryptPassword(dataToUpdate.password);
        }
      } else {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.passwordRequired });
      }
    }
    findProfile.profilePicture = dataToUpdate.profilePicture;
    findProfile.save();
    console.log(findProfile);
    return res.status(statusCodes[200].value).send({
      status: statusCodes[200].message,
      message: successMessage.update,
      data: findProfile,
      update: dataToUpdate
    });
  } catch (err) {
    console.error(err);
    return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
  }
}
const createBlog = async function (req, res) {
  try {
    let data = req.body;
    let files = req.files;
    if (isEmptyBody(data)) {
      return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.emptyBody });
    }
    if (!isPresent(data.heading)) {
      return res.status(statusCodes[400].value).send({
        status: statusCodes[404].message,
        message: errorMessage.required,
      });
    }
    if (!isPresent(data.author)) {
      return res.status(statusCodes[404].value).send({
        status: statusCodes[404].message,
        message: errorMessage.required,
      });
    }
    if (!isPresent(data.description)) {
      return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessarequired });
    }
    if (!isPresent(data.link)) {
      return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.required });
    }
    const id = uuidV4();
    if (uuidValidate(id)) {
      data.blogId = id;
    }
    if (files.length !== 0) {
      data.profilePicture = await s3Upload.uploadFile(files[0]);
    }
    const savedData = await blogModel.create(data);
    return res.status(statusCodes[201].value).send({ status: statusCodes[201].message, message: successMessage.success, data: savedData });
  } catch (err) {
    return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
  }
};

const editBlog = async function (req, res) {
  try {
    let dataToUpdate = JSON.parse(JSON.stringify(req.body));
    let blogId = req.params.Id;
    let files = req.files;
    if (files.length !== 0) {
      dataToUpdate.profilePicture = await s3Upload.uploadFile(files[0]);
    }
    if (isEmptyBody(dataToUpdate)) {
      return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.emptyBody });
    }
    const findBlog = await blogModel.findOne({ blogId: blogId }).select({ __v: 0, createdAt: 0, updatedAt: 0 });
    if (findBlog === null) {
      return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.notFound });
    }
    if (dataToUpdate.hasOwnProperty("heading")) {
      if (!(isPresent(dataToUpdate.heading))) {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.required + `(${getErrorField(dataToUpdate, dataToUpdate.heading)})` });
      } else {
        findBlog.heading = dataToUpdate.heading;
      }
    }
    if (dataToUpdate.hasOwnProperty("image")) {

      if (isPresent(dataToUpdate.image)) {
        findBlog.image = dataToUpdate.image;
      } else {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.image });
      }
    }
    if (dataToUpdate.hasOwnProperty("author")) {
      if (isPresent(dataToUpdate.author)) {
        findBlog.author = dataToUpdate.author;
      } else {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.required + `(${getErrorField(dataToUpdate, dataToUpdate.author)})` });
      }
    }
    if (dataToUpdate.hasOwnProperty("description")) {
      if (isPresent(dataToUpdate.description)) {
        findBlog.description = dataToUpdate.description;
      } else {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.required + `(${getErrorField(dataToUpdate, dataToUpdate.description)})` });
      }
    }
    if (dataToUpdate.hasOwnProperty("link")) {
      if (isPresent(dataToUpdate.link)) {
        findBlog.link = dataToUpdate.link;
      } else {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.required + `(${getErrorField(dataToUpdate, dataToUpdate.link)})` });
      }
    }
    findBlog.profilePicture = dataToUpdate.profilePicture;
    findBlog.save();
    return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.update, data: findBlog });
  } catch (err) {
    console.log(err)
    return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
  }
}

const getBlogsById = async function (req, res) {
  try {
    let blogId = req.params.Id;
    const findBlog = await blogModel.findOne({ blogId: blogId }).select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });
    if (findBlog === null) {
      return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.notFound });
    } else {
      return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.success, data: findBlog });
    }
  } catch (err) {
    console.error(err);
    return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
  }
}

const getBlogs = async function (req, res) {
  try {
    const findBlogs = await blogModel.find({ isDeleted: false }).select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });
    if (findBlogs.length === 0) {
      return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.notFound });
    }
    return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.success, data: findBlogs });
  } catch (err) {
    console.error(err);
    return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
  }
}

const deleteBlog = async function (req, res) {
  try {
    let blogId = req.params.Id.split(",");
    const findBlog = await blogModel.find({ $and: [{ blogId: { $in: blogId } }, { isDeleted: false }] }).updateMany({ isDeleted: true });
    if (findBlog.matchedCount === 0) {
      return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.notFound });
    }
    return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.delete, data: findBlog, Id: blogId });
  } catch (err) {
    return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
  }
}


const createTestimonials = async function (req, res) {
  try {
    let data = req.body;
    let files = req.files;
    if (isEmptyBody(data)) {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.emptyBody });
    }
    if (!isPresent(data.name)) {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.nameRequired });
    } else {
      if (!isValidName(data.name)) {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.name });
      }
    }
    if (!isPresent(data.companyName)) {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.companyInfo });
    } else {
      if (!isValidName(data.companyName)) {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.name });
      }
    }
    if (!isPresent(data.designation)) {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.positionRequired });
    } else {
      if (!isValidPosition(data.designation)) {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.position });
      }
    }
    if (!isPresent(data.testimonialContent)) {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.testimonialRequired });
    }
    const id = uuidV4();
    if (uuidValidate(id)) {
      data.uId = id;
    }
    if (files.length !== 0) {
      data.profilepicture = await s3Upload.uploadFile(files[0]);
    }
    const savedData = await testimonialModel.create(data);
    return res.status(statusCodes[201].value).send({ status: statusCodes[201].message, message: successMessage.success, data: savedData });
  } catch (err) {
    return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
  }
}

const editTestimonials = async function (req, res) {
  try {
    let dataToUpdate = JSON.parse(JSON.stringify(req.body));
    let id = req.params.Id;
    let files = req.files;
    if (files.length !== 0) {
      dataToUpdate.profilePicture = await s3Upload.uploadFile(files[0]);
    }
    if (isEmptyBody(dataToUpdate)) {
      return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.emptyBody });
    }
    const findDoc = await testimonialModel.findOne({ uId: id });
    if (findDoc === null) {
      return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.notFound });
    } else {
      if (dataToUpdate.hasOwnProperty("name")) {
        if (!isPresent(dataToUpdate.name)) {
          return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.nameRequired });
        }
        else if (!isValidName(dataToUpdate.name)) {
          return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.name });
        } else {
          findDoc.name = dataToUpdate.name;
        }
      }
      if (dataToUpdate.hasOwnProperty("companyName")) {
        if (!isPresent(dataToUpdate.companyName)) {
          return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.nameRequired });
        }
        else if (!isValidName(dataToUpdate.companyName)) {
          return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.name });
        } else {
          findDoc.companyName = dataToUpdate.companyName;
        }
      }
      if (dataToUpdate.hasOwnProperty("designation")) {
        if (!isPresent(dataToUpdate.designation)) {
          return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.positionRequired });
        }
        if (!isValidPosition(dataToUpdate.designation)) {
          return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.position });
        } else {
          findDoc.designation = dataToUpdate.designation;
        }
      }
      if (dataToUpdate.hasOwnProperty("testimonialContent")) {
        if (!isPresent(dataToUpdate.testimonialContent)) {
          return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.testimonialRequired });
        }
        findDoc.testimonialContent = dataToUpdate.testimonialContent;
      }
      findDoc.profilePicture = dataToUpdate.profilePicture;
      findDoc.save();
    }
    return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.update, data: findDoc });
  } catch (err) {
    console.log(err)
    return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
  }
}

const deleteTestimonials = async function (req, res) {
  try {
    let id = req.params.Id.split(',');
    let findTestimonials = await testimonialModel.find({ $and: [{ uId: { $in: id } }, { isDeleted: false }] }).updateMany({ isDeleted: true });
    if (findTestimonials.matchedCount === 0) {
      return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.notFound });
    }
    return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.delete, data: findTestimonials, Id: id });
  } catch (err) {
    console.error(err);
    return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
  }
}

const getAlltestimonials = async function (req, res) {
  try {
    const findTestimonials = await testimonialModel.find({ isDeleted: false }).select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });
    if (findTestimonials.length === 0) {
      return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.notFound });
    }
    return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.success, data: findTestimonials });
  } catch (err) {
    console.error(err);
    return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
  }
}

const getTestimonialsById = async function (req, res) {
  try {
    let Id = req.params.Id;
    const findTestimonials = await testimonialModel.findOne({ $and: [{ uId: Id }, { isDeleted: false }] }).select({ _id: 0, updatedAt: 0, __v: 0, createdAt: 0 });
    if (findTestimonials.length === 0) {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.notFound });
    } else {
      return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.success, data: findTestimonials, id: Id });
    }
  } catch (err) {
    console.error(err);
    return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
  }
}

const supportTicket = async (req, res) => {
  let date = req.query.date;
  let ticketData = await supportFormModel.find();
  let totalCountTicket = ticketData.length;
  let newTicketCount = await supportFormModel.find({ status: "New" }).count();
  let pendingTicketCount = await supportFormModel.find({ status: "Pending" }).count();
  let solvedTicketCount = await supportFormModel.find({ status: "Solved" }).count();
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const startindex = (page - 1) * limit;
  const endIndex = page * limit;
  const result = {};
  if (date) {
    result.date = { $regex: date, $options: "i" };
  }
  if (endIndex < ticketData.length) {
    result.next = {
      page: page + 1,
      limit: limit
    };
  }
  if (startindex > 0) {
    result.previous = {
      page: page - 1,
      limit: limit
    };
  }
  result.results = await supportFormModel.find(result).limit(limit).skip(startindex).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0, password: 0 });
  if (result) {
    return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.success, counts: { TotalSupportTickets: totalCountTicket, newTicketCount: newTicketCount, pendingTicketCount: pendingTicketCount, solvedTicketCount: solvedTicketCount, data: result } });
  }
  return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.notFound });
}

const getTicketById = async (req, res) => {
  let Id = req.params.Id;
  const findTickets = await supportFormModel.findOne({ $and: [{ uId: Id }] }).select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });
  if (findTickets.length === 0) {
    return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.notFound });
  }
  return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.success, data: findTickets, identify: Id });
}

const updateTicketStatus = async (req, res) => {
  try {
    let id = req.params.Id;
    const updateTicket = await supportForm.findOneAndUpdate({ uId: id }, { status: "Solved" }, { new: true });
    if (updateTicket === null) {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.notFound });
    }
    return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, data: updateTicket });

  } catch (error) {
    console.log(error);
    return res.status(statusCodes[500].value).send({
      status: statusCodes[500].message, message: error.message
    });

  }
}

const getUserCount = async (req, res) => {
  try {
    const investorCount = await investor.find();
    const startupCount = await startUp.find();
    const susbsCount = 500;
    return res.json({
      investors: investorCount.length,
      startups: startupCount.length,
      users: investorCount.length + startupCount.length,
      subscriptions: susbsCount
    });
  } catch (err) {
    return res.status(statusCodes[500].value).send({
      status: statusCodes[500].message, message: err.message
    });
  }
}

const getAdminList = async (req, res) => {
  try {
    let date = req.query.date;
    let adminData = await adminModel.find({ isDeleted: false });
    // console.log(adminData)
    if (adminData.length === 0) {
      return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: errorMessage.notFound });
    }

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startindex = (page - 1) * limit;
    const endIndex = page * limit;
    const result = {};
    if (date) {
      result.date = { $regex: date, $options: "i" };
    }
    if (endIndex < adminData.length) {
      result.next = {
        page: page + 1,
        limit: limit
      };
    }
    if (startindex > 0) {
      result.previous = {
        page: page - 1,
        limit: limit
      };
    }
    result.results = await adminModel.find({ $and: [{ isDeleted: false }, result] }).limit(limit).skip(startindex).select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0, password: 0 });
    if (result) {
      return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, data: result });
    } else {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.notFound });
    }
  } catch (err) {
    return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: err.message });
  }
}

const getUserById = async (req, res) => {
  let Id = req.params.Id;
  const findUsers = await adminModel
    .findOne({ $and: [{ userId: Id }] })
    .select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });
  if (findUsers === null) {
    return res.status(statusCodes[400].value).send({
      status: statusCodes[400].message,
      message: errorMessage.notFound,
    });
  }
  return res.status(statusCodes[200].value).send({
    status: statusCodes[200].message,
    message: successMessage.success,
    data: findUsers,
    identify: Id,
  });
};

const createUser = async function (req, res) {
  try {
    let data = req.body;
    let files = req.files;
    if (isEmptyBody(data)) {
      return res.status(statusCodes[400].value).send({
        status: statusCodes[400].message,
        message: errorMessage.emptyBody,
      });
    }
    if (!isPresent(data.name)) {
      return res.status(statusCodes[400].value).send({
        status: statusCodes[400].message,
        message: errorMessage.nameRequired,
      });
    } else {
      if (!isValidName(data.name)) {
        return res.status(statusCodes[400].value).send({
          status: statusCodes[400].message,
          message: errorMessage.name,
        });
      }
    }
    if (!isPresent(data.email)) {
      return res.status(statusCodes[400].value).send({
        status: statusCodes[400].message,
        message: errorMessage.emailRequired,
      });
    } else {
      if (!isValidEmail(data.email)) {
        return res.status(statusCodes[400].value).send({
          status: statusCodes[400].message,
          message: errorMessage.email,
        });
      }
    }
    if (!isPresent(data.password)) {
      return res.status(statusCodes[400].value).send({
        status: statusCodes[400].message,
        message: errorMessage.passwordRequired,
      });
    }
    if (!isPresent(data.confirmPassword)) {
      return res.status(statusCodes[400].value).send({
        status: statusCodes[400].message,
        message: errorMessage.passwordRequired,
      });
    }
    if (!isValidPassword(data.password, data.confirmPassword)) {
      return res.status(statusCodes[400].value).send({
        status: statusCodes[400].message,
        message: errorMessage.password,
      });
    } else {
      // hasEncryptPassword(data.password,data.confirmPassword);
      const encryptPassword = await bcrypt.hash(data.password, 10);
      data.password = encryptPassword;
      delete data.confirmPassword;
    }
    if (!isPresent(data.role)) {
      return res.status(statusCodes[400].value).send({
        status: statusCodes[400].message,
        message: errorMessage.required + getErrorField(data, data.role),
      });
    }

    const id = uuidV4();
    if (uuidValidate(id)) {
      data.userId = id;
    }

    if (files.length !== 0) {
      data.profilePicture = await s3Upload.uploadFile(files[0]);
    }
    const savedData = await adminModel.create(data);
    return res.status(statusCodes[201].value).send({
      status: statusCodes[201].message,
      message: successMessage.success,
      data: savedData,
    });
  } catch (err) {
    return res
      .status(statusCodes[500].value)
      .send({ status: statusCodes[500].message, message: err.message });
  }
};

const updateUser = async function (req, res) {
  try {
    let dataToUpdate = JSON.parse(JSON.stringify(req.body));
    let id = req.params.Id;
    let files = req.files;

    if (files.length !== 0) {
      dataToUpdate.profilePicture = await s3Upload.uploadFile(files[0]);
    }
    if (isEmptyBody(dataToUpdate)) {
      return res.status(statusCodes[404].value).send({
        status: statusCodes[404].message,
        message: errorMessage.emptyBody,
      });
    }
    const findDoc = await adminModel.findOne({ userId: id });
    if (findDoc === null) {
      return res.status(statusCodes[404].value).send({
        status: statusCodes[404].message,
        message: errorMessage.notFound,
      });
    } else {
      if (dataToUpdate.hasOwnProperty("name")) {
        if (!isPresent(dataToUpdate.name)) {
          return res.status(statusCodes[400].value).send({
            status: statusCodes[400].message,
            message: errorMessage.nameRequired,
          });
        } else if (!isValidName(dataToUpdate.name)) {
          return res.status(statusCodes[400].value).send({
            status: statusCodes[400].message,
            message: errorMessage.name,
          });
        } else {
          findDoc.name = dataToUpdate.name;
        }
      }
      if (dataToUpdate.hasOwnProperty("email")) {
        if (!isPresent(dataToUpdate.email)) {
          return res.status(statusCodes[400].value).send({
            status: statusCodes[400].message,
            message: errorMessage.emailRequired,
          });
        } else if (!isValidEmail(dataToUpdate.email)) {
          return res.status(statusCodes[400].value).send({
            status: statusCodes[400].message,
            message: errorMessage.email,
          });
        } else {
          findDoc.email = dataToUpdate.email;
        }
      }
      if (dataToUpdate.hasOwnProperty("role")) {
        if (!isPresent(dataToUpdate.role)) {
          return res.status(statusCodes[400].value).send({
            status: statusCodes[400].message,
            message:
              errorMessage.required +
              getErrorField(dataToUpdate, dataToUpdate.role),
          });
        } else {
          findDoc.role = dataToUpdate.role;
        }
      }
      findDoc.profilePicture = dataToUpdate.profilePicture;
    }
    findDoc.save();
    return res.status(statusCodes[200].value).send({
      status: statusCodes[200].message,
      message: successMessage.update,
      data: findDoc,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(statusCodes[500].value)
      .send({ status: statusCodes[500].message, message: err.message });
  }
};

const deleteUser = async function (req, res) {
  try {
    let userId = req.params.Id;
    const findUser = await adminModel
      .findOne({ userId: userId });
    if (findUser === null) {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.notFound });
    }
    else {
      findUser.isDeleted = true;
    }
    findUser.save();
    return res.status(statusCodes[200].value).send({
      status: statusCodes[200].message,
      message: successMessage.delete,
      data: findUser,
      Id: userId,
    });
  } catch (err) {
    return res
      .status(statusCodes[500].value)
      .send({ status: statusCodes[500].message, message: err.message });
  }
};

// const dashboardAdmin = async (req,res)=>{
//   let data = req.body;
//   data.date = new Date(req.params.date);
//   // console.log(typeof data.date);
//   const saveData = await adminModel.create(data);
//   res.send({data:saveData});
// }

const getDashboardData = async (req, res) => {
  let today = new Date();
  let fromDate = new Date(req.query.date);
  const investorDataCount = await investor.aggregate([
    {
      '$match': {
        '$and': [
          { createdAt: { '$lt': today } },
          { createdAt: { '$gt': fromDate } },
          { isDeleted: { '$eq': false } }
        ],
      }
    },
    {
      '$project': {
        'month': {
          '$month': '$createdAt'
        },
        'year': {
          '$year': '$createdAt'
        }
      }
    }, {
      '$group': {
        '_id': {
          'month': '$month',
          'year': '$year'
        },
        'total': {
          '$sum': 1
        },
      }
    },
    {
      "$sort": {
        "_id.year": 1,
        "_id.month": 1
      }
    }
  ]);
  let investorCount = countDashboard(investorDataCount);
  const startupDataCount = await startUp.aggregate([
    {
      '$match': {
        '$and': [
          { createdAt: { '$lt': today } },
          { createdAt: { '$gt': fromDate } },
          { isActive: { '$eq': true } }
        ],
      }
    },
    {
      '$project': {
        'month': {
          '$month': '$createdAt'
        },
        'year': {
          '$year': '$createdAt'
        }
      }
    }, {
      '$group': {
        '_id': {
          'month': '$month',
          'year': '$year'
        },
        'total': {
          '$sum': 1
        },
      }
    },
    {
      "$sort": {
        "_id.year": 1,
        "_id.month": 1
      }
    }
  ]);
  let startupCount = countDashboard(startupDataCount);
  return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.success, investorCount: investorCount, startupCount: startupCount });
}

const pricingModel = require("../models/pricingPlan");

const pricingPlan = async (req, res) => {
  let data = req.body;
  let identify = req.query.key;
  // console.log(identify)
  if (identify === undefined) {
    return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.query });
  }
  if (!data.basicPlan || !data.premiumPlan) {
    return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.required })
  }
  if (identify.toLowerCase() === "startup" || identify.toLowerCase() === "investor") {
    const id = uuidV4();
    data.type = identify.toLowerCase();
    data.uId = id;
    const pricingData = await pricingModel.create(data);
    return res.status(statusCodes[201].value).send({ status: statusCodes[201].message, message: successMessage.success, data: pricingData });
  } else {
    return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.query });
  }
};

const getPricing = async (req, res) => {
  let identify = req.query.key;
  if (identify === undefined) {
    return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.query });
  }
  if (identify.toLowerCase() === "startup" || identify.toLowerCase() === "investor") {
    const getpricing = await pricingModel.findOne({ type: identify }).select({ basicPlan: 1, premiumPlan: 1, _id: 0 });
    return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.success, data: getpricing });
  } else {
    return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.query });
  }
};

const updatePricing = async (req, res) => {
  let identify = req.query.key;
  let dataToUpdate = JSON.parse(JSON.stringify(req.body));
  const findData = await pricingModel.findOne({ type: identify });
  if (dataToUpdate.hasOwnProperty("basicPlan")) {
    if (isPresent(dataToUpdate.basicPlan)) {
      findData.basicPlan = dataToUpdate.basicPlan;
    } else {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.required });
    }
  }
  if (dataToUpdate.hasOwnProperty("premiumPlan")) {
    if (isPresent(dataToUpdate.premiumPlan)) {
      findData.premiumPlan = dataToUpdate.premiumPlan;
    } else {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.required });
    }
  }
  findData.save();
  return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.update, data: findData });
};

const settings = require("../models/generalSettings");
const supportForm = require("../models/supportForm");

const loginImageUpload = async (req, res) => {
  let files = req.files;
  let identify = req.query.key;
  if (identify === undefined) {
    return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.query });
  }
  if (identify.toLowerCase() === "investor" || identify.toLowerCase() === "startup") {
    if (files.length !== 0) {
      var imageLink = await s3Upload.uploadFile(files[0]);
    } else {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: "please Provide Image" });
    }
    let obj = {
      loginImage: imageLink,
      type: identify
    }
    const saveImage = await settings.create(obj);
    return res.status(statusCodes[201].value).send({ status: statusCodes[201].message, message: successMessage.success, data: saveImage });
  } else {
    return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.query });
  }
}

const loginImageUpdate = async (req, res) => {
  let files = req.files;
  let identify = req.query.key;
  if (identify === undefined) {
    return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.query });
  }
  if (identify.toLowerCase() === "investor" || identify.toLowerCase() === "startup") {
    if (files.length !== 0) {
      var imageLink = await s3Upload.uploadFile(files[0]);
    } else {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: "please Provide Image" });
    }
    const findData = await settings.findOne({ type: identify });
    if (findData === null) {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.notFound });
    } else {
      findData.loginImage = imageLink;
    }
    findData.save();
    return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.update, data: findData });
  } else {
    return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.query });
  }
};

const getImageLink = async (req, res) => {
  let identify = req.query.key;
  if (identify.toLowerCase() === "investor" || identify.toLowerCase() === "startup") {
    const link = await settings.findOne({ type: identify });
    return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.success, data: link });
  }
  else {
    return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.query });
  }
}

const deleteCustomers = async (req, res) => {
  let identify = req.query.key;
  let id = req.params.Id;
  if (identify.toLowerCase() === "investor") {
    const findProfile = await investor.findOne({ $and: [{ uId: id }, { isDeleted: false }] });
    if (findProfile === null) {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.notFound });
    } else {
      findProfile.isDeleted = true;
    }
    findProfile.save();
    return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.success, data: findProfile });
  }
  else if (identify.toLowerCase() === "startup") {
    const findProfile = await startUp.findOne({ $and: [{ userId: id }, { isDeleted: false }] });
    if (findProfile === null) {
      return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.notFound });
    } else {
      findProfile.isActive = false;
    }
    findProfile.save();
    return res.status(statusCodes[200].value).send({ status: statusCodes[200].message, message: successMessage.success, data: findProfile });
  }
  else {
    return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.query });
  }
}

const createStartupPlan = async (req, res) => {
  const { error } = createStartupPlanValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const data = await StartupPricing.create(req.body);
  return res.send({ data });
}

const getStartupPlans = async (req, res) => {
  const data = await StartupPricing.find();
  return res.send({ data });
}

const updateStartupPlan = async (req, res) => {
  const data = await StartupPricing.findByIdAndUpdate(req.params.id, req.body, { new: true });
  return res.send({ msg: `plan updated successfully` });
}

const createInvestorPlan = async (req, res) => {
  const { error } = createInvestorPlanValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const data = await InvestorPricing.create(req.body);
  return res.send({ data });
}

const getInvestorPlans = async (req, res) => {
  const data = await InvestorPricing.find();
  return res.send({ data });
}

const updateInvestorPlan = async (req, res) => {
  const data = await InvestorPricing.findByIdAndUpdate(req.params.id, req.body, { new: true });
  return res.send({ msg: `plan updated successfully` });
}
module.exports = {
  getAdminProfile,
  updateProfileAdmin,
  createBlog,
  editBlog,
  getBlogs,
  getBlogsById,
  createTestimonials,
  editTestimonials,
  deleteBlog,
  deleteTestimonials,
  getAlltestimonials,
  getTestimonialsById,
  supportTicket,
  getTicketById,
  getUserCount,
  getAdminList,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getDashboardData,
  pricingPlan,
  getPricing,
  updatePricing,
  loginImageUpload,
  loginImageUpdate,
  getImageLink,
  deleteCustomers,
  createStartupPlan,
  getStartupPlans,
  updateStartupPlan,
  createInvestorPlan,
  getInvestorPlans,
  updateInvestorPlan,
  updateTicketStatus
};
