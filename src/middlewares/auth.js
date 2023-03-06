const jwt = require("jsonwebtoken");
const { statusCodes, tokenGeneration } = require("../util/utility");

const auth = async function (req, res, next) {
    try {
        let token = req.header("Authorization", "Bearer token");
        if (!token) {
            return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: "Set Token" });
        }
        let tokenData = token.split(" ");
        let verifyToken = jwt.verify(tokenData[1], tokenGeneration.key);
        if (!verifyToken) {
            return res.status(statusCodes[401].value).send({ status: statusCodes[401].message });
        } else {
            if (Date.now() > (verifyToken.exp) * 1000) {
                return res.status(statusCodes[404].value).send({ status: statusCodes[404].message, message: "Session Expired,please login Again..!!" });
            } else {
                req.validateUser = verifyToken.userId;
                next();
            }
        }
    } catch (err) {
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message });
    }
}

module.exports = { auth };