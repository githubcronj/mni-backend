const mongoose = require('mongoose');

const investorPricingSchema = new mongoose.Schema({
    plan: { type: String, trim: true },
    price: { type: String, trim: true }
})

module.exports = mongoose.model('InvestorPlan', investorPricingSchema);