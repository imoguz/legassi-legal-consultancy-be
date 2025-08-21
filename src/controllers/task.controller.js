"use strict";

const { createAuditLog } = require("../helpers/audit.helper");
const Task = require("../models/task.model");
const Matter = require("../models/matter.model");

module.exports = {
  create: async (req, res, next) => {
    try {
      const { matter, title, description, assignedTo, dueDate, priority } =
        req.body;

      const relatedMatter = await Matter.findOne({
        _id: matter,
        isDeleted: false,
      });
      if (!relatedMatter) return res.status(404).send("Matter not found.");

      const isAuthorized =
        req.user.role === "admin" ||
        req.user.role === "manager" ||
        relatedMatter.assignedAttorney.toString() === req.user.id ||
        relatedMatter.teamMembers.some(
          (tm) => tm.member.toString() === req.user.id
        );

      if (!isAuthorized)
        return res
          .status(403)
          .send("You are not authorized to add a task to this matter.");

      const newTask = await Task.create({
        matter,
        title,
        description,
        assignedTo,
        dueDate,
        priority,
        createdBy: req.user.id,
      });

      // Audit log
      await createAuditLog({
        collectionName: "tasks",
        documentId: newTask._id,
        changedBy: req.user.id,
        changedFields: [
          "matter",
          "title",
          "description",
          "assignedTo",
          "dueDate",
          "priority",
        ],
        operation: "create",
        previousValues: {},
        newValues: newTask.toObject(),
      });

      res.status(201).json(newTask);
    } catch (err) {
      next(err);
    }
  },

  readMany: async (req, res, next) => {
    try {
      let baseFilters;

      if (req.user.role === "admin" || req.user.role === "manager") {
        baseFilters = { isDeleted: false };
      } else {
        baseFilters = {
          isDeleted: false,
          $or: [{ assignedTo: req.user.id }, { createdBy: req.user.id }],
        };
      }

      const tasks = await req.queryHandler(
        Task,
        [
          { path: "matter", select: "_id title matterNumber" },
          {
            path: "assignedTo",
            select: "_id firstname lastname email position profileUrl",
          },
        ],
        ["title", "status", "priority"], // searchable fields
        baseFilters
      );

      res.status(200).json(tasks);
    } catch (err) {
      next(err);
    }
  },

  readOne: async (req, res, next) => {
    try {
      const task = await Task.findOne({ _id: req.params.id, isDeleted: false })
        .populate({
          path: "matter",
          select: "_id title matterNumber",
        })
        .populate({
          path: "assignedTo",
          select: "_id firstname lastname email position profileUrl",
        });

      if (!task) return res.status(404).send("Task not found.");

      const relatedMatter = task.matter;
      const isAuthorized =
        req.user.role === "admin" ||
        req.user.role === "manager" ||
        relatedMatter.assignedAttorney.toString() === req.user.id ||
        relatedMatter.teamMembers.some(
          (tm) => tm.member.toString() === req.user.id
        ) ||
        task.assignedTo._id.toString() === req.user.id;

      if (!isAuthorized)
        return res
          .status(403)
          .send("You are not authorized to view this task.");

      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  },

  getMatter: async (req, res, next) => {
    try {
      let baseFilters = { isDeleted: false };

      if (req.user.role === "admin" || req.user.role === "manager") {
        baseFilters = { isDeleted: false };
      } else if (req.user.role === "staff") {
        baseFilters = {
          isDeleted: false,
          $or: [
            { assignedAttorney: req.user.id },
            { "teamMembers.member": req.user.id },
          ],
        };
      } else {
        baseFilters = { _id: null };
      }

      const result = await req.queryHandler(
        Matter,
        null, // populate
        ["title, matterNumber"], // searchable fields
        baseFilters
      );

      const response = result.data.map((m) => ({
        matterId: m._id,
        title: m.title,
        matterNumber: m.matterNumber,
      }));

      res.status(200).json({
        data: response,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.id).populate("matter");

      if (!task || task.isDeleted)
        return res.status(404).send("Task not found.");

      const relatedMatter = task.matter;
      const isAuthorized =
        req.user.role === "admin" ||
        req.user.role === "manager" ||
        relatedMatter.assignedAttorney.toString() === req.user.id ||
        task.createdBy.toString() === req.user.id;

      if (!isAuthorized)
        return res
          .status(403)
          .send("You are not authorized to update this task.");

      const changedFields = Object.keys(req.body).filter(
        (key) => JSON.stringify(task[key]) !== JSON.stringify(req.body[key])
      );

      const previousValues = {};
      const newValues = {};
      changedFields.forEach((field) => {
        previousValues[field] = task[field];
        newValues[field] = req.body[field];
      });

      if (changedFields.length === 0) {
        return res
          .status(200)
          .json({ message: "No valid changes provided for update." });
      }

      Object.assign(task, req.body);
      await task.save();

      // Audit log
      await createAuditLog({
        collectionName: "tasks",
        documentId: task._id,
        changedBy: req.user.id,
        changedFields,
        operation: "update",
        previousValues,
        newValues,
      });

      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  },

  _delete: async (req, res, next) => {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        isDeleted: false,
      }).populate("matter");
      if (!task) return res.status(404).send("Task not found.");

      const relatedMatter = task.matter;
      const isAuthorized =
        req.user.role === "admin" ||
        req.user.role === "manager" ||
        relatedMatter.assignedAttorney.toString() === req.user.id ||
        task.createdBy.toString() === req.user.id;

      if (!isAuthorized)
        return res
          .status(403)
          .send("You are not authorized to delete this task.");

      const previousValues = { isDeleted: task.isDeleted };
      task.isDeleted = true;
      await task.save();

      // Audit log
      await createAuditLog({
        collectionName: "tasks",
        documentId: task._id,
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
        return res.status(403).send("Only admins can purge tasks.");
      }

      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).send("Task not found.");

      // Audit log
      await createAuditLog({
        collectionName: "tasks",
        documentId: task._id,
        changedBy: req.user.id,
        changedFields: [],
        operation: "purge",
        previousValues: task.toObject(),
        newValues: {},
      });

      await Task.deleteOne({ _id: req.params.id });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
