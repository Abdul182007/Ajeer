const express = require("express");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// Public, read-only permit lookup. Full residence number is displayed on the public permit page as requested; publish only with the employee's authorization.
router.get("/public/:permitNumber", async (req, res, next) => {
  try {
    const permitNumber = String(req.params.permitNumber || "").trim().toUpperCase();
    if (!permitNumber || permitNumber.length > 80) {
      return res.status(400).json({ message: "رقم التصريح غير صحيح." });
    }
    const employee = await Employee.findOne({ permitNumber }).lean();
    if (!employee) return res.status(404).json({ message: "لم يتم العثور على التصريح." });

    const now = new Date().toISOString().slice(0, 10);
    const expired = employee.declarationExpiryDate < now;
    res.json({
      permitNumber: employee.permitNumber,
      permitType: employee.permitType,
      declarationStartDate: employee.declarationStartDate,
      declarationExpiryDate: employee.declarationExpiryDate,
      employeeName: employee.employeeName,
      occupation: employee.occupation,
      nationality: employee.nationality,
      dateOfBirth: employee.dateOfBirth,
      sex: employee.sex,
      residenceNumber: employee.residenceNumber || "",
      establishmentName: employee.establishmentName,
      establishmentNumber: employee.establishmentNumber,
      active: Boolean(employee.active) && !expired,
      statusText: !employee.active ? "التصريح غير نشط" : expired ? "انتهت صلاحية التصريح" : "التصريح ساري المفعول"
    });
  } catch (err) { next(err); }
});

router.use(requireAdmin);

const allowedFields = [
  "permitNumber", "permitType", "declarationStartDate", "declarationExpiryDate",
  "employeeName", "occupation", "nationality", "dateOfBirth", "sex",
  "residenceNumber", "establishmentName", "establishmentNumber", "active"
];

function cleanPayload(body) {
  const data = {};
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, key)) data[key] = body[key];
  }
  if (typeof data.permitNumber === "string") data.permitNumber = data.permitNumber.trim().toUpperCase();
  return data;
}

function validateDates(data) {
  if (data.declarationStartDate && data.declarationExpiryDate &&
      data.declarationExpiryDate < data.declarationStartDate) {
    return "Permit expiry date cannot be earlier than the start date.";
  }
  return null;
}

// Read all employee records (admin only).
router.get("/", async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 }).lean();
    res.json(employees);
  } catch (err) { next(err); }
});

// Add an employee.
router.post("/", async (req, res, next) => {
  try {
    const data = cleanPayload(req.body || {});
    const dateError = validateDates(data);
    if (dateError) return res.status(400).json({ message: dateError });

    const employee = await Employee.create(data);
    res.status(201).json(employee);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "That permit number already exists." });
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    next(err);
  }
});

// Update an employee by MongoDB document ID.
router.put("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid employee ID." });
    }
    const data = cleanPayload(req.body || {});
    const dateError = validateDates(data);
    if (dateError) return res.status(400).json({ message: dateError });

    const employee = await Employee.findByIdAndUpdate(
      req.params.id, data, { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ message: "Employee record not found." });
    res.json(employee);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "That permit number already exists." });
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    next(err);
  }
});

// Delete an employee.
router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid employee ID." });
    }
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee record not found." });
    res.json({ message: "Employee deleted successfully." });
  } catch (err) { next(err); }
});

module.exports = router;
