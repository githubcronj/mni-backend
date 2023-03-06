class CustomErrorHandler extends Error {
    constructor(status, msg){
        super();
        this.status = status;
        this.message = msg;
    }
    static notFound(message = '404 Not Found'){
        return new CustomErrorHandler(404, message);
    }
    static serverError(message = 'Internal Server Error'){
        return new CustomErrorHandler(500, message);
    }
    static alreadyExists(message){
        return new CustomErrorHandler(409, message);
    }
}

module.exports = CustomErrorHandler;

