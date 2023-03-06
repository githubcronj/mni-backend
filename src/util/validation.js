const { string } = require('joi');
const Joi = require('joi');

//Investor POST validation
const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required(),
        subscription: Joi.string().valid('basic', 'premium'),
        industry: Joi.string(),
        password: Joi.string().min(8).alphanum().required(),
        confirmPassword: Joi.string().required().valid(Joi.ref('password')),
        location: Joi.string(),
        designation: Joi.string(),
        email: Joi.string().email().required(),
        description: Joi.string().max(250),
        areaOfExperise: Joi.string(),
        companiesBacked: Joi.string()

    })
    return schema.validate(data);
}

const updateValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().optional().allow(''),
        age: Joi.number().optional().allow(''),
        subscription: Joi.string().valid('basic', 'premium'),
        industry: Joi.string().optional().allow(''),
        location: Joi.string().optional().allow(''),
        occupation: Joi.string().optional().allow(''),
        email: Joi.string().email().optional().allow(''),
        description: Joi.string().max(1500).optional().allow(''),
        companyName: Joi.string().max(50).optional().allow(''),
        phoneNumber: Joi.string().regex(/^[0-9]{10}$/).messages({ 'string.pattern.base': `Phone number must have 10 digits.` }),
        areaOfExpertise: Joi.string().optional().allow(null, ''),
        companiesBacked: Joi.string().optional().allow(null, ''),
        profilePicture: Joi.string().optional().allow('')
    })
    return schema.validate(data);
}

const createStartupPlanValidation = (data) => {
    const schema = Joi.object({
        plan: Joi.string().required(),
        price: Joi.string().required()
    })
    return schema.validate(data);
}

const createInvestorPlanValidation = (data) => {
    const schema = Joi.object({
        plan: Joi.string().required(),
        price: Joi.string().required()
    })
    return schema.validate(data);
}


module.exports = {
    registerValidation,
    updateValidation,
    createStartupPlanValidation,
    createInvestorPlanValidation
}

