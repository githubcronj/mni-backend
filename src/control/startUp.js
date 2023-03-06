const startUpModel = require("../models/startUp");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();
const {
    isEmptyBody,
    isPresent,
    isValidName,
    isValidPosition,
    isPaymentDone,
    isValidEmail,
    hasEncryptPassword,
    getErrorField,
    isValidPhone,
} = require("../service/service");
const {
    errorMessage,
    statusCodes,
    successMessage,
} = require("../util/utility");
const employeesModel = require("../models/companyEmployees");
const { validate: uuidValidate, v4: uuidV4 } = require("uuid");
const supportForm = require("../models/supportForm");
const s3upload = require("../service/s3Upload");
const {
    sendSupportMailSuccess,
    sendSupportMail,
} = require("../util/SendEmail");

const getStartupProfile = async function (req, res) {
    try {
        let id = req.query.id;
        let findProfile = await startUpModel
            .find({ userId: id, isActive: true })
            .select({ _id: 0, password: 0 });
        if (findProfile.length == 0) {
            return res.status(statusCodes[400].value).send({
                status: statusCodes[400].message,
                message: errorMessage.notFound,
            });
        }
        let findEmployees = await employeesModel.find({
            companyId: id,
            isActive: true,
        });
        let resultData = {
            ...findProfile,
            peoples: findEmployees,
        };
        return res.status(statusCodes[200].value).send({
            status: statusCodes[200].message,
            message: successMessage.success,
            data: resultData,
        });
    } catch (err) {
        return res
            .status(statusCodes[500].value)
            .send({ status: statusCodes[500].message, message: err.message });
    }
};

const getStartupListAdmin = async function (req, res) {
    let date = req.query.date;
    let startupData = await startUpModel.find({
        $and: [{ isActive: true }, { isBlocked: false }],
    });
    if (startupData.length === 0) {
        return res.status(statusCodes[404].value).send({
            status: statusCodes[404].message,
            message: errorMessage.notFound,
        });
    }
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startindex = (page - 1) * limit;
    const endIndex = page * limit;
    const result = {};
    if (date) {
        result.signUpDate = date;
    }
    if (endIndex < startupData.length) {
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
    result.results = await startUpModel
        .find({ $and: [{ isDeleted: false, isBlocked: false }, result] })
        .limit(limit)
        .skip(startindex)
        .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0, password: 0 }); //isActive:true ??
    if (result) {
        return res
            .status(statusCodes[200].value)
            .send({ status: statusCodes[200].message, data: result });
    } else {
        return res.status(statusCodes[400].value).send({
            status: statusCodes[400].message,
            message: errorMessage.notFound,
        });
    }
};

const addEmployees = async function (req, res) {
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
        if (!isPresent(data.position)) {
            return res.status(statusCodes[400].value).send({
                status: statusCodes[400].message,
                message: errorMessage.positionRequired,
            });
        } else {
            if (!isValidPosition(data.position)) {
                return res.status(statusCodes[400].value).send({
                    status: statusCodes[400].message,
                    message: errorMessage.position,
                });
            }
        }
        if (!isPresent(data.companyId)) {
            return res.status(statusCodes[400].value).send({
                status: statusCodes[400].message,
                message: errorMessage.companyIdRequired,
            });
        }
        const id = uuidV4();
        if (uuidValidate(id)) {
            data.userId = id;
        }
        if (files.length !== 0) {
            data.profilePicture = await s3upload.uploadFile(files[0]);
        }
        const employeeData = await employeesModel.create(data);
        return res.status(statusCodes[201].value).send({
            status: statusCodes[201].message,
            message: successMessage.employeeCreated,
            data: employeeData,
        });
    } catch (err) {
        console.log(err);
        return res
            .status(statusCodes[500].value)
            .send({ status: statusCodes[500].message, message: err.message });
    }
};

const deleteEmployee = async function (req, res) {
    try {
        let id = req.query.id;
        const findEmployees = await employeesModel.findOne({ userId: id });
        if (findEmployees.isActive === true) {
            findEmployees.isActive = false;
        } else {
            return res.status(statusCodes[400].value).send({
                status: statusCodes[400].message,
                message: errorMessage.employeeDeleted,
            });
        }
        findEmployees.save();
        return res.status(statusCodes[200].value).send({
            status: statusCodes[200].message,
            message: successMessage.employeeDeleted,
        });
    } catch (err) {
        return res
            .status(statusCodes[500].value)
            .send({ status: statusCodes[500].message, message: err.message });
    }
};

const updateEmployee = async function (req, res) {
    try {
        let employeeId = req.query.id;
        let dataToUpdate = req.body;
        let files = req.files;
        const findEmployees = await employeesModel.findOne({ userId: employeeId });
        if (findEmployees === null) {
            return res.status(statusCodes[404].value).send({
                status: statusCodes[404].message,
                message: errorMessage.notFound,
            });
        } else {
            if (isPresent(dataToUpdate.name)) {
                if (!isValidName(dataToUpdate.name)) {
                    return res.status(statusCodes[404].value).send({
                        status: statusCodes[404].message,
                        message: errorMessage.name,
                    });
                } else {
                    findEmployees.name = dataToUpdate.name;
                }
            }
            if (isPresent(dataToUpdate.position)) {
                if (!isValidPosition(dataToUpdate.position)) {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message: errorMessage.position,
                    });
                } else {
                    findEmployees.position = dataToUpdate.position;
                }
            }
            if (files.length !== 0) {
                findEmployees.profilePicture = await s3upload.uploadFile(files[0]);
            }
        }
        findEmployees.save();
        return res.status(statusCodes[200].value).send({
            status: statusCodes[200].message,
            message: successMessage.update,
            data: findEmployees,
        });
    } catch (err) {
        console.log(err);
        return res
            .status(statusCodes[500].value)
            .send({ status: statusCodes[500].message, message: err.message });
    }
};

const updateProfile = async function (req, res) {
    try {
        let dataToUpdate = JSON.parse(JSON.stringify(req.body));
        let startupId = req.params.Id;
        if (!uuidValidate(startupId)) {
            return res
                .status(statusCodes[400].value)
                .send({ status: statusCodes[400].message, message: errorMessage.id });
        }
        const docToUpdate = await startUpModel.findOne({ userId: startupId });
        if (!docToUpdate) {
            return res.status(statusCodes[400].value).send({
                status: statusCodes[400].message,
                message: errorMessage.notFound,
            });
        }
        let files = req.files;
        if (files.length !== 0) {
            for (let i = 0; i < files.length; i++) {
                if (files[i].fieldname === "profilePicture") {
                    docToUpdate.profilePicture = await s3upload.uploadFile(files[i]);
                } else if (files[i].fieldname === "thumbnail") {
                    docToUpdate.thumbnail = await s3upload.uploadFile(files[i]);
                } else if (files[i].fieldname === "pitch") {
                    docToUpdate.pitch = await s3upload.uploadFile(files[i]);
                } else {
                    break;
                }
            }
        }
        if (isEmptyBody(dataToUpdate)) {
            // return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.emptyBody });
        } else {
            if (dataToUpdate.hasOwnProperty("companyName")) {
                if (isPresent(dataToUpdate.companyName)) {
                    if (isValidName(dataToUpdate.companyName)) {
                        docToUpdate.companyName = dataToUpdate.companyName;
                    } else {
                        return res.status(statusCodes[400].value).send({
                            status: statusCodes[400].message,
                            message: errorMessage.name,
                        });
                    }
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message: errorMessage.nameRequired,
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("location")) {
                if (isPresent(dataToUpdate.location)) {
                    docToUpdate.location = dataToUpdate.location;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message: errorMessage.locationRequired,
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("contactNumber")) {
                if (isPresent(dataToUpdate.contactNumber)) {
                    if (isValidPhone(dataToUpdate.contactNumber)) {
                        docToUpdate.contactNumber = dataToUpdate.contactNumber;
                    } else {
                        return res.status(statusCodes[400].value).send({
                            status: statusCodes[400].message,
                            message: errorMessage.phone,
                        });
                    }
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message: errorMessage.phoneRequired,
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("password")) {
                if (isPresent(dataToUpdate.password)) {
                    docToUpdate.password = hasEncryptPassword(dataToUpdate.password);
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.password),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("equityOffer")) {
                if (isPresent(dataToUpdate.equityOffer)) {
                    docToUpdate.equityOffer = dataToUpdate.equityOffer;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.equityOffer),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("legalName")) {
                if (isPresent(dataToUpdate.legalName)) {
                    docToUpdate.legalName = dataToUpdate.legalName;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.legalName),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("industry")) {
                if (isPresent(dataToUpdate.industry)) {
                    docToUpdate.industry = dataToUpdate.industry;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.industry),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("companyValuation")) {
                if (isPresent(dataToUpdate.companyValuation)) {
                    docToUpdate.companyValuation = dataToUpdate.companyValuation;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.companyValuation),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("employeeCount")) {
                if (isPresent(dataToUpdate.employeeCount)) {
                    docToUpdate.employeeCount = dataToUpdate.employeeCount;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.employeeCount),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("askPrice")) {
                if (isPresent(dataToUpdate.askPrice)) {
                    docToUpdate.askPrice = dataToUpdate.askPrice;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.askPrice),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("founded")) {
                if (isPresent(dataToUpdate.founded)) {
                    docToUpdate.founded = dataToUpdate.founded;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.founded),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("form")) {
                if (isPresent(dataToUpdate.form)) {
                    docToUpdate.form = dataToUpdate.form;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.form),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("headquarter")) {
                if (isPresent(dataToUpdate.headquarter)) {
                    docToUpdate.headquarter = dataToUpdate.headquarter;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.headquarter),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("websiteUrl")) {
                if (isPresent(dataToUpdate.websiteUrl)) {
                    docToUpdate.websiteUrl = dataToUpdate.websiteUrl;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.websiteUrl),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("yearlyGrossRevenue")) {
                if (isPresent(dataToUpdate.yearlyGrossRevenue)) {
                    docToUpdate.yearlyGrossRevenue = dataToUpdate.yearlyGrossRevenue;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.yearlyGrossRevenue),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("yearlyNetProfit")) {
                if (isPresent(dataToUpdate.yearlyNetProfit)) {
                    docToUpdate.yearlyNetProfit = dataToUpdate.yearlyNetProfit;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.yearlyNetProfit),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("lastQuarterGrossRevenue")) {
                if (isPresent(dataToUpdate.lastQuarterGrossRevenue)) {
                    docToUpdate.lastQuarterGrossRevenue =
                        dataToUpdate.lastQuarterGrossRevenue;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.lastQuarterGrossRevenue),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("lastQuarterNetProfit")) {
                if (isPresent(dataToUpdate.lastQuarterNetProfit)) {
                    docToUpdate.lastQuarterNetProfit = dataToUpdate.lastQuarterNetProfit;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.lastQuarterNetProfit),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("lastMonthGrossRevenue")) {
                if (isPresent(dataToUpdate.lastMonthGrossRevenue)) {
                    docToUpdate.lastMonthGrossRevenue =
                        dataToUpdate.lastMonthGrossRevenue;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.lastMonthGrossRevenue),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("lastMonthNetProfit")) {
                if (isPresent(dataToUpdate.lastMonthNetProfit)) {
                    docToUpdate.lastMonthNetProfit = dataToUpdate.lastMonthNetProfit;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.lastMonthNetProfit),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("assetsValue")) {
                if (isPresent(dataToUpdate.assetsValue)) {
                    docToUpdate.assetsValue = dataToUpdate.assetsValue;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.assetsValue),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("liabilitiesValue")) {
                if (isPresent(dataToUpdate.liabilitiesValue)) {
                    docToUpdate.liabilitiesValue = dataToUpdate.liabilitiesValue;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.liabilitiesValue),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("loans")) {
                if (isPresent(dataToUpdate.loans)) {
                    docToUpdate.loans = dataToUpdate.loans;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.loans),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("strength")) {
                if (isPresent(dataToUpdate.strength)) {
                    docToUpdate.strength = dataToUpdate.strength;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.strength),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("weakness")) {
                if (isPresent(dataToUpdate.weakness)) {
                    docToUpdate.weakness = dataToUpdate.weakness;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.weakness),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("threats")) {
                if (isPresent(dataToUpdate.threats)) {
                    docToUpdate.threats = dataToUpdate.threats;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.threats),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("opportunities")) {
                if (isPresent(dataToUpdate.opportunities)) {
                    docToUpdate.opportunities = dataToUpdate.opportunities;
                } else {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message:
                            errorMessage.required +
                            getErrorField(dataToUpdate, dataToUpdate.opportunities),
                    });
                }
            }
            if (dataToUpdate.hasOwnProperty("phase")) {
                if (isPresent(dataToUpdate.phase)) {
                    docToUpdate.phase = dataToUpdate.phase;
                } else {
                    return res.status(400).send({ message: `Phase is required` });
                }
            }
            if (dataToUpdate.hasOwnProperty("companyInfo")) {
                if (isPresent(dataToUpdate.companyInfo)) {
                    docToUpdate.companyInfo = dataToUpdate.companyInfo;
                } else {
                    return res.status(400).send({ message: `Company Info is required` });
                }
            }
            // docToUpdate.profilePicture = dataToUpdate.profilePicture;
            // docToUpdate.pitch = dataToUpdate.pitch;
            // docToUpdate.thumbnail = dataToUpdate.thumbnail;
        }
        docToUpdate.save();
        return res.status(200).send({
            status: statusCodes[200].message,
            message: successMessage.update,
            data: docToUpdate,
        });
    } catch (err) {
        console.log(err);
        return res
            .status(statusCodes[500].value)
            .send({ status: statusCodes[500].message, message: err.message });
    }
};

const blockStartup = async function (req, res) {
    try {
        let startupId = req.params.Id.split(",");
        const findProfile = await startUpModel
            .find({
                $and: [
                    { userId: { $in: Object.values(startupId) } },
                    { isActive: true },
                    { isBlocked: false },
                ],
            })
            .updateMany({ isBlocked: true });
        // console.log(findProfile);
        if (isEmptyBody(startupId)) {
            return res.status(statusCodes[400].value).send({
                status: statusCodes[400].message,
                message: errorMessage.notFound,
            });
        }
        if (findProfile.matchedCount !== 0) {
            return res.status(statusCodes[200].value).send({
                status: statusCodes[200].message,
                message: successMessage.blocked,
                usersBlocked: Object.values(startupId),
            });
        } else {
            return res.status(statusCodes[400].value).send({
                status: statusCodes[400].message,
                message: errorMessage.alreadyBlocked,
            });
        }
    } catch (err) {
        return res
            .status(statusCodes[500].value)
            .send({ status: statusCodes[500].message, message: err.message });
    }
};

const unblockStartup = async function (req, res) {
    try {
        let startupId = req.params.Id.split(",");
        const findProfile = await startUpModel
            .find({
                $and: [
                    { userId: { $in: Object.values(startupId) } },
                    { isActive: true },
                    { isBlocked: true },
                ],
            })
            .updateMany({ isBlocked: false });
        if (findProfile.modifiedCount !== 0) {
            return res.status(statusCodes[200].value).send({
                status: statusCodes[200].message,
                message: successMessage.unblock,
                usersUnblocked: Object.values(startupId),
            });
        } else {
            return res.status(statusCodes[400].value).send({
                status: statusCodes[400].message,
                message: errorMessage.alreadyUnblocked,
            });
        }
    } catch (err) {
        return res
            .status(statusCodes[500].value)
            .send({ status: statusCodes[500].message, message: err.message });
    }
};

const upgradeSubscription = async function (req, res) {
    try {
        let startupId = req.params.Id;
        if (!uuidValidate(startupId)) {
            return res
                .status(statusCodes[400].value)
                .send({ status: statusCodes[400].message, message: errorMessage.id });
        }
        let findProfile = await startUpModel.findOne({ userId: startupId });
        if (findProfile.subscription === "basic") {
            if (isPaymentDone()) {
                findProfile.subscription = "premium";
                findProfile.save();
                return res.status(statusCodes[202].value).send({
                    status: statusCodes[202].message,
                    message: successMessage.subscription,
                });
            }
        } else {
            return res.status(statusCodes[400].value).send({
                status: statusCodes[400].message,
                message: errorMessage.alreadySubscribed,
            });
        }
    } catch (err) {
        return res
            .status(statusCodes[500].value)
            .send({ status: statusCodes[500].message, message: err.message });
    }
};

const createSupportForm = async function (req, res) {
    try {
        let data = JSON.parse(JSON.stringify(req.body));
        if (data.hasOwnProperty("name")) {
            if (isPresent(data.name)) {
                if (!isValidName(data.name)) {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message: errorMessage.name,
                    });
                }
            } else {
                return res.status(statusCodes[400].value).send({
                    status: statusCodes[400].message,
                    message: errorMessage.required + getErrorField(data, data.name),
                });
            }
        } else {
            return res.status(statusCodes[400].value).send({
                status: statusCodes[400].message,
                message: errorMessage.nameRequired,
            });
        }
        if (data.hasOwnProperty("email")) {
            if (isPresent(data.email)) {
                if (!isValidEmail(data.email)) {
                    return res.status(statusCodes[400].value).send({
                        status: statusCodes[400].message,
                        message: errorMessage.email,
                    });
                }
            } else {
                return res.status(statusCodes[400].value).send({
                    status: statusCodes[400].message,
                    message: errorMessage.required + getErrorField(data, data.name),
                });
            }
        } else {
            return res.status(statusCodes[400].value).send({
                status: statusCodes[400].message,
                message: errorMessage.emailRequired,
            });
        }
        if (data.hasOwnProperty("subject")) {
            if (!isPresent(data.subject)) {
                return res.status(statusCodes[400].value).send({
                    status: statusCodes[400].message,
                    message: errorMessage.required + getErrorField(data, data.subject),
                });
            }
        } else {
            return res.status(statusCodes[400].value).send({
                status: statusCodes[400].message,
                message: errorMessage.required + getErrorField(data, data.subject),
            });
        }
        if (data.hasOwnProperty("typeOfIssue")) {
            if (!isPresent(data.typeOfIssue)) {
                return res.status(statusCodes[400].value).send({
                    status: statusCodes[400].message,
                    message:
                        errorMessage.required + getErrorField(data, data.typeOfIssue),
                });
            }
        } else {
            return res.status(statusCodes[400].value).send({
                status: statusCodes[400].message,
                message: errorMessage.required + getErrorField(data, data.typeOfIssue),
            });
        }
        if (data.hasOwnProperty("description")) {
            if (!isPresent(data.description)) {
                return res.status(statusCodes[400].value).send({
                    status: statusCodes[400].message,
                    message:
                        errorMessage.required + getErrorField(data, data.description),
                });
            }
        } else {
            return res.status(statusCodes[400].value).send({
                status: statusCodes[400].message,
                message: errorMessage.required + getErrorField(data, data.description),
            });
        }
        const id = uuidV4();
        if (uuidValidate(id)) {
            data.uId = id;
        }
        const createData = await supportForm.create(data);
        sendSupportMail(data.name, data.email, data.subject, data.description);
        sendSupportMailSuccess(data.name, data.email);
        return res.status(statusCodes[200].value).send({
            status: statusCodes[200].message,
            message: "Thank you for contacting us. We will get back to you.",
            data: createData,
        });
    } catch (err) {
        return res
            .status(statusCodes[500].value)
            .send({ status: statusCodes[500].message, message: err.message });
    }
};

module.exports = {
    getStartupProfile,
    updateProfile,
    addEmployees,
    deleteEmployee,
    updateEmployee,
    blockStartup,
    unblockStartup,
    upgradeSubscription,
    createSupportForm,
    getStartupListAdmin,
};