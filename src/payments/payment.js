const { STATUS_CODES } = require("http");
const Razorpay = require("razorpay");
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const crypto = require("crypto");
const investor = require("../models/investor");
const startUp = require("../models/startUp");
const { statusCodes, errorMessage } = require("../util/utility");
const { setExpiration } = require("../service/service");



const instance = new Razorpay({
    key_id: process.env.RAZOR_TEST_ID,
    key_secret: process.env.RAZOR_TEST_SECRET,
});


const orderCreate = async (req, res) => {
    var options = {
        amount: req.body.amount * 100,  // amount in the smallest currency unit
        currency: req.body.currency,
        receipt: req.body.receiptId
    };
    try {
        const order = await instance.orders.create(options);
        // console.log(order);
        return res.send({ orderDetails: order, orderId: order.id, amount: order.amount });
    } catch (err) {
        return res.status(statusCodes[500].value).send({ msg: err.message });
    }
};


// test page url -- https://rzp.io/l/e7k5BImk97

const webHookTrigger = async (req, res) => {
    if (req.body.event === "payment.failed") {
        console.log("payment failed")
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message });
    };
    const secret_key = process.env.RAZOR_LIVE_SECRET;
    let { order_id, id, email } = req.body.payload.payment.entity;
    const body = order_id + "|" + id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZOR_LIVE_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');
    console.log("sig generated ", expectedSignature);
    if (expectedSignature) {
        req.body.subscriptionExpiry = setExpiration();
        const identifyUser = await startUp.findOneAndUpdate({ email: email }, { subscription: "premium", paymentDetails: req.body }, { new: true });
        if (identifyUser === null) {
            const findInvestor = await investor.findOneAndUpdate({ email: email }, { subscription: "premium", paymentDetails: req.body }, { new: true });
            if (findInvestor === null) {
                return res.status(statusCodes[404].value).send({ status: statusCodes[404].message });
            }
        }
        return res.status(statusCodes[200].value).send({ status: statusCodes[200].message });
    } else {
        return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: "Invalid Signature" });
    }
};

const downgradeSubscription = async (req, res) => {
    try {
        let email = req.params.email;
        let identify = req.query.key;
        if (identify.toLowerCase() === "startup") {
            const updateStartup = await startUp.findOneAndUpdate({ email: email, subscription: "premium" }, { subscription: "basic" }, { new: true });
            if (updateStartup === null) {
                return res.status(statusCodes[404].value).send({ status: statusCodes[404].message });
            }
        } else if (identify.toLowerCase() === "investor") {
            const updateInvestor = await investor.findOneAndUpdate({ email: email, subscription: "premium" }, { subscription: "basic" }, { new: true });
            if (updateInvestor === null) {
                return res.status(statusCodes[404].value).send({ status: statusCodes[404].message });
            }
        } else {
            return res.status(statusCodes[400].value).send({ status: statusCodes[400].message, message: errorMessage.query });
        }
        return res.status(statusCodes[200].value).send({ status: statusCodes[200].message });
    } catch (error) {
        console.log(error);
        return res.status(statusCodes[500].value).send({ status: statusCodes[500].message, message: error.message })
    }
}



module.exports = {
    orderCreate,
    webHookTrigger,
    downgradeSubscription
}
