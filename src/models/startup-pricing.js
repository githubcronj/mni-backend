const mongoose = require('mongoose');

const startupPricingSchema = new mongoose.Schema({
    plan: { type: String, trim: true },
    price: { type: String, trim: true }
})

module.exports = mongoose.model('StartupPlan', startupPricingSchema);