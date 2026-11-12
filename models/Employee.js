const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  permitNumber: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 80 },
  permitType: { type: String, required: true, trim: true, maxlength: 120 },
  declarationStartDate: { type: String, required: true, trim: true },
  declarationExpiryDate: { type: String, required: true, trim: true },
  employeeName: { type: String, required: true, trim: true, maxlength: 160 },
  occupation: { type: String, required: true, trim: true, maxlength: 120 },
  nationality: { type: String, required: true, trim: true, maxlength: 100 },
  dateOfBirth: { type: String, required: true, trim: true },
  sex: { type: String, required: true, trim: true, maxlength: 40 },
  residenceNumber: { type: String, required: true, trim: true, maxlength: 80 },
  establishmentName: { type: String, required: true, trim: true, maxlength: 180 },
  establishmentNumber: { type: String, required: true, trim: true, maxlength: 80 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

employeeSchema.index({ permitNumber: 1 }, { unique: true });
employeeSchema.index({ employeeName: 1 });
employeeSchema.index({ establishmentNumber: 1 });

module.exports = mongoose.model("Employee", employeeSchema);
