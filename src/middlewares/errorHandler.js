const {ValidationError} = require('joi');
const CustomErrorHandler = require('../service/CustomErrorHandler');
const mongoose = require('mongoose');

const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let data = {
        message : "Internal Server Error"
    }
    if(err instanceof CustomErrorHandler){
        statusCode = err.status;
        data = {
            message : err.message
        }
    }
    return res.status(statusCode).json(data);
}

module.exports = errorHandler;
