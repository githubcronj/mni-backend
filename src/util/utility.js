// register

const errorMessage = {
    id: "invalid id",
    age: "invalid Age",
    name: "Invalid Name",
    email: "Invalid Email",
    phone: "Invalid Phone",
    image: "image link required",
    unique: "Already present",
    emailUnique: "email Already present",
    phoneUnique: "Phone Already present",
    query: "Invalid Query Identifier",
    found: "data found",
    password: "Invalid Password",
    position: "Invalid Position",
    required: "Mandatory field missing",
    askPrice: "ask is required",
    notFound: "No Document Found",
    emptyBody: "Mandatory fields missing!",
    companyInfo: "company info required",
    emptySearch: "No user Found",
    authenticate: "no User Found , please Sign Up",
    nameRequired: "Name is Required",
    emailRequired: "Email is Required",
    passwordRequired: "Password Is Required",
    phoneRequired: "Phone is Required",
    industryRequired: "Industry is required",
    locationRequired: "Location is Required",
    foundedRequired: "founded Field is required",
    equityRequired: "equity field is Required",
    positionRequired: "position is Required",
    companyIdRequired: "Company Id is required",
    employeeDeleted: "Employee is already Deleted.",
    invalidLogin: "Invalid Login Credential",
    alreadyBlocked: "user Already blocked",
    alreadyUnblocked: "User Already Unblocked,First Block!!",
    alreadySubscribed: "user ALready subscribed",
    testimonialRequired: "Testimonial is Mandatory",
    uniquePassword: "cannot type same password"

}

const successMessage = {
    success: "successfull",
    login: "Welcome to xyz..",
    update: "Data Successfully Update",
    delete: "Successfully Deleted",
    employeeCreated: "Employee Data Successfully created",
    employeeDeleted: "Employee successfully Deleted",
    blocked: "User Successfully Blocked",
    subscription: "Subscription successfully uprgraded",
    unblock: "Done! user successfully unblocked",
    Delievered: "Message Successfully Delievered",
    chat: "Chat Initiated"
}

const tokenGeneration = {
    key: "Secretkey",
    time: "24H"
}

const regex = {
    password: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
    phone: /(\d[ -]*)/,
    name: /^[a-zA-Z ]+$/,
    position: /^[a-z\d\-_\s]+$/i
}

const limit = {
    showLimit: 3
}

const confirmEmail = {
    find: true
}

const statusCodes = {
    100: { value: 100, message: 'Continue' },
    101: { value: 101, message: 'Switching Protocols' },
    102: { value: 102, message: 'Processing' },
    103: { value: 103, message: 'Early Hints' },
    200: { value: 200, message: 'OK' },
    201: { value: 201, message: 'Created' },
    202: { value: 202, message: 'Accepted' },
    203: { value: 203, message: 'Non-Authoritative Information' },
    204: { value: 204, message: 'No Content' },
    205: { value: 205, message: 'Reset Content' },
    206: { value: 206, message: 'Partial Content' },
    207: { value: 207, message: 'Multi-Status' },
    208: { value: 208, message: 'Already Reported' },
    226: { value: 226, message: 'IM Used' },
    300: { value: 300, message: 'Multiple Choices' },
    301: { value: 301, message: 'Moved Permanently' },
    302: { value: 302, message: 'Found' },
    303: { value: 303, message: 'See Other' },
    304: { value: 304, message: 'Not Modified' },
    305: { value: 305, message: 'Use Proxy' },
    307: { value: 307, message: 'Temporary Redirect' },
    308: { value: 308, message: 'Permanent Redirect' },
    400: { value: 400, message: 'Bad Request' },
    401: { value: 401, message: 'Unauthorized' },
    402: { value: 402, message: 'Payment Required' },
    403: { value: 403, message: 'Forbidden' },
    404: { value: 404, message: 'Not Found' },
    405: { value: 405, message: 'Method Not Allowed' },
    406: { value: 406, message: 'Not Acceptable' },
    407: { value: 407, message: 'Proxy Authentication Required' },
    408: { value: 408, message: 'Request Timeout' },
    409: { value: 409, message: 'Conflict' },
    410: { value: 401, message: 'Gone' },
    411: { value: 411, message: 'Length Required' },
    412: { value: 412, message: 'Precondition Failed' },
    413: { value: 413, message: 'Payload Too Large' },
    414: { value: 414, message: 'URI Too Long' },
    415: { value: 415, message: 'Unsupported Media Type' },
    416: { value: 416, message: 'Range Not Satisfiable' },
    417: { value: 417, message: 'Expectation Failed' },
    418: { value: 418, message: "I'm a Teapot" },
    421: { value: 421, message: 'Misdirected Request' },
    422: { value: 422, message: 'Unprocessable Entity' },
    423: { value: 423, message: 'Locked' },
    424: { value: 424, message: 'Failed Dependency' },
    425: { value: 425, message: 'Too Early' },
    426: { value: 426, message: 'Upgrade Required' },
    427: { value: 428, message: 'Precondition Required' },
    429: { value: 429, message: 'Too Many Requests' },
    431: { value: 431, message: 'Request Header Fields Too Large' },
    451: { value: 451, message: 'Unavailable For Legal Reasons' },
    500: { value: 500, message: 'Internal Server Error' },
    501: { value: 501, message: 'Not Implemented' },
    502: { value: 502, message: 'Bad Gateway' },
    503: { value: 503, message: 'Service Unavailable' },
    504: { value: 504, message: 'Gateway Timeout' },
    505: { value: 505, message: 'HTTP Version Not Supported' },
    506: { value: 506, message: 'Variant Also Negotiates' },
    507: { value: 507, message: 'Insufficient Storage' },
    508: { value: 508, message: 'Loop Detected' },
    509: { value: 509, message: 'Bandwidth Limit Exceeded' },
    510: { value: 510, message: 'Not Extended' },
    511: { value: 511, message: 'Network Authentication Required' }
}


const paymentRedirectUrl = {
    success_url: 'http://localhost:5500/src/payments/success.html',
    cancel_url: 'http://localhost:5000/cancel'
}

module.exports = {
    errorMessage,
    successMessage,
    statusCodes,
    regex,
    tokenGeneration,
    limit,
    confirmEmail,
    paymentRedirectUrl
}
