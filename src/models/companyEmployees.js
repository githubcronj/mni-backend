const mongoose = require("mongoose");
const objectId = mongoose.Schema.Types.ObjectId;

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    position: {
        type: String,
        trim: true
    },
    userId:{
        type:String
    },
    companyId:{
        type:String
    },
    profilePicture:{
        type:String
    },
    companyData: {
        type: objectId,
        ref:"startupModel"
    },
    isActive:{
        type:Boolean,
        default:true
    }
}, { timestamps: true });


module.exports = mongoose.model("employeesModel", employeeSchema);