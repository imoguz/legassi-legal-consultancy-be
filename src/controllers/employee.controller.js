"use strict";

const Employee = require("../models/employee.model");
const { createAuditLog } = require("../helpers/audit.helper");
const {
  uploadToCloudinaryBuffer,
  deleteFromCloudinary,
} = require("../helpers/cloudinary");

module.exports = {
  create: async (req, res, next) => {
    try {
      const newEmployee = await Employee.create({
        ...req.body,
        createdBy: req.user.id,
      });

      // Audit log
      await createAuditLog({
        collectionName: "employees",
        documentId: newEmployee._id,
        changedBy: req.user.id,
        changedFields: Object.keys(req.body),
        operation: "create",
        previousValues: {},
        newValues: newEmployee.toObject(),
      });

      res.status(201).json(newEmployee);
    } catch (err) {
      next(err);
    }
  },

  readMany: async (req, res, next) => {
    try {
      const baseFilters = { isDeleted: false };

      const employees = await req.queryHandler(
        Employee,
        ["createdBy"], // populate
        ["firstname", "lastname", "department", "position"], // searchable
        baseFilters
      );

      res.status(200).json(employees);
    } catch (err) {
      next(err);
    }
  },

  readOne: async (req, res, next) => {
    try {
      const employee = await Employee.findOne({
        _id: req.params.id,
        isDeleted: false,
      }).populate("createdBy");

      if (!employee) return res.status(404).send("Employee not found.");

      res.status(200).json(employee);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const employee = await Employee.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

      if (!employee) return res.status(404).send("Employee not found.");

      const previousValues = {};
      const newValues = {};

      // Cloudinary upload
      let profileImageUpdate = null;

      if (req.file) {
        const result = await uploadToCloudinaryBuffer(
          req.file.buffer,
          req.file.originalname
        );

        if (result?.public_id) {
          if (employee.profileImage?.id) {
            await deleteFromCloudinary(employee.profileImage.id);
          }
          profileImageUpdate = {
            id: result.public_id,
            url: result.secure_url,
          };
        }
      }

      const parsedBody = {};
      Object.keys(req.body).forEach((key) => {
        try {
          parsedBody[key] = JSON.parse(req.body[key]);
        } catch {
          parsedBody[key] = req.body[key];
        }
      });

      Object.keys(parsedBody).forEach((key) => {
        if (JSON.stringify(employee[key]) !== JSON.stringify(parsedBody[key])) {
          previousValues[key] = employee[key];
          newValues[key] = parsedBody[key];
        }
      });

      if (profileImageUpdate) {
        previousValues.profileImage = employee.profileImage;
        newValues.profileImage = profileImageUpdate;
      }

      if (Object.keys(previousValues).length === 0 && !profileImageUpdate) {
        return res
          .status(200)
          .json({ message: "No valid changes provided for update." });
      }

      Object.assign(employee, parsedBody, { updatedBy: req.user.id });
      if (profileImageUpdate) {
        employee.profileImage = profileImageUpdate;
      }
      await employee.save();

      // Audit log
      await createAuditLog({
        collectionName: "employees",
        documentId: employee._id,
        changedBy: req.user.id,
        changedFields: [...Object.keys(previousValues)],
        operation: "update",
        previousValues,
        newValues,
      });

      res.status(200).json(employee);
    } catch (err) {
      next(err);
    }
  },

  _delete: async (req, res, next) => {
    try {
      const employee = await Employee.findById(req.params.id);

      if (!employee) return res.status(404).send("Employee not found.");

      employee.isDeleted = true;
      await employee.save();

      // Audit log
      await createAuditLog({
        collectionName: "employees",
        documentId: employee._id,
        changedBy: req.user.id,
        changedFields: ["isDeleted"],
        operation: "delete",
        previousValues,
        newValues: { isDeleted: true },
      });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  purge: async (req, res, next) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).send("Only admins can purge employees.");
      }

      const employee = await Employee.findById(req.params.id);
      if (!employee) return res.status(404).send("Employee not found.");

      // Audit log
      await createAuditLog({
        collectionName: "employees",
        documentId: employee._id,
        changedBy: req.user.id,
        changedFields: [],
        operation: "purge",
        previousValues: employee.toObject(),
        newValues: {},
      });

      await Employee.deleteOne({ _id: req.params.id });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
