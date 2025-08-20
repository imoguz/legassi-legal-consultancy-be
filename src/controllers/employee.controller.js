"use strict";

const Employee = require("../models/employee.model");
const { createAuditLog } = require("../helpers/audit.helper");

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
        ["createdBy", "updatedBy", "deletedBy"], // populate
        ["firstName", "lastName", "department", "position", "systemRole"], // searchable
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
      }).populate("createdBy updatedBy deletedBy");

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

      const changedFields = Object.keys(req.body).filter(
        (key) => employee[key] !== req.body[key]
      );
      const previousValues = {};
      const newValues = {};

      changedFields.forEach((field) => {
        previousValues[field] = employee[field];
        newValues[field] = req.body[field];
      });

      if (changedFields.length === 0) {
        return res
          .status(200)
          .json({ message: "No valid changes provided for update." });
      }

      Object.assign(employee, req.body, { updatedBy: req.user.id });
      await employee.save();

      // Audit log
      await createAuditLog({
        collectionName: "employees",
        documentId: employee._id,
        changedBy: req.user.id,
        changedFields,
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
