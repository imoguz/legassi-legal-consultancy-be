"use strict";

const CalendarEvent = require("../models/calendarEvent.model");
const { createAuditLog } = require("../helpers/audit.helper");

module.exports = {
  create: async (req, res, next) => {
    try {
      const {
        title,
        description,
        startDate,
        endDate,
        allDay,
        matter,
        task,
        participants,
        location,
        eventType,
        color,
      } = req.body;

      const newEvent = await CalendarEvent.create({
        title,
        description,
        startDate,
        endDate,
        allDay,
        matter,
        task,
        participants,
        location,
        eventType,
        color,
        createdBy: req.user.id,
      });

      // Audit log
      await createAuditLog({
        collectionName: "calendarEvents",
        documentId: newEvent._id,
        changedBy: req.user.id,
        changedFields: Object.keys(req.body),
        operation: "create",
        previousValues: {},
        newValues: newEvent.toObject(),
      });

      res.status(201).json(newEvent);
    } catch (err) {
      next(err);
    }
  },

  readMany: async (req, res, next) => {
    try {
      const { start, end } = req.query;

      const filters = { isDeleted: false };
      if (start && end) {
        filters.startDate = { $gte: new Date(start) };
        filters.endDate = { $lte: new Date(end) };
      }

      if (req.user.role !== "admin" && req.user.role !== "manager") {
        filters.$or = [
          { createdBy: req.user.id },
          { participants: req.user.id },
        ];
      }

      const events = await CalendarEvent.find(filters)
        .populate("matter", "_id title matterNumber")
        .populate("task", "_id title status")
        .populate(
          "participants",
          "_id firstname lastname email position profileUrl"
        )
        .populate("createdBy", "_id firstname lastname email");

      res.status(200).json(events);
    } catch (err) {
      next(err);
    }
  },

  readOne: async (req, res, next) => {
    try {
      const event = await CalendarEvent.findOne({
        _id: req.params.id,
        isDeleted: false,
      })
        .populate("matter", "_id title matterNumber")
        .populate("task", "_id title status")
        .populate(
          "participants",
          "_id firstname lastname email position profileUrl"
        )
        .populate("createdBy", "_id firstname lastname email");

      if (!event) return res.status(404).send("Event not found.");

      // Authorization
      if (
        req.user.role !== "admin" &&
        req.user.role !== "manager" &&
        event.createdBy._id.toString() !== req.user.id &&
        !event.participants.some((p) => p._id.toString() === req.user.id)
      ) {
        return res.status(403).send("Not authorized to view this event.");
      }

      res.status(200).json(event);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const event = await CalendarEvent.findOne({
        _id: req.params.id,
        isDeleted: false,
      });
      if (!event) return res.status(404).send("Event not found.");

      if (
        req.user.role !== "admin" &&
        req.user.role !== "manager" &&
        event.createdBy.toString() !== req.user.id
      ) {
        return res.status(403).send("Not authorized to update this event.");
      }

      const changedFields = Object.keys(req.body).filter(
        (key) => JSON.stringify(event[key]) !== JSON.stringify(req.body[key])
      );

      const previousValues = {};
      const newValues = {};
      changedFields.forEach((field) => {
        previousValues[field] = event[field];
        newValues[field] = req.body[field];
      });

      if (changedFields.length === 0) {
        return res
          .status(200)
          .json({ message: "No valid changes provided for update." });
      }

      Object.assign(event, req.body);
      await event.save();

      await createAuditLog({
        collectionName: "calendarEvents",
        documentId: event._id,
        changedBy: req.user.id,
        changedFields,
        operation: "update",
        previousValues,
        newValues,
      });

      res.status(200).json(event);
    } catch (err) {
      next(err);
    }
  },

  _delete: async (req, res, next) => {
    try {
      const event = await CalendarEvent.findOne({
        _id: req.params.id,
        isDeleted: false,
      });
      if (!event) return res.status(404).send("Event not found.");

      if (
        req.user.role !== "admin" &&
        req.user.role !== "manager" &&
        event.createdBy.toString() !== req.user.id
      ) {
        return res.status(403).send("Not authorized to delete this event.");
      }

      event.isDeleted = true;
      await event.save();

      await createAuditLog({
        collectionName: "calendarEvents",
        documentId: event._id,
        changedBy: req.user.id,
        changedFields: ["isDeleted"],
        operation: "delete",
        previousValues: { isDeleted: false },
        newValues: { isDeleted: true },
      });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  purge: async (req, res, next) => {
    try {
      if (req.user.role !== "admin")
        return res.status(403).send("Only admins can purge events.");

      const event = await CalendarEvent.findById(req.params.id);
      if (!event) return res.status(404).send("Event not found.");

      await createAuditLog({
        collectionName: "calendarEvents",
        documentId: event._id,
        changedBy: req.user.id,
        changedFields: [],
        operation: "purge",
        previousValues: event.toObject(),
        newValues: {},
      });

      await CalendarEvent.deleteOne({ _id: req.params.id });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  getEventsByMatter: async (req, res, next) => {
    try {
      const events = await CalendarEvent.find({
        matter: req.params.matterId,
        isDeleted: false,
      })
        .populate("participants", "_id firstname lastname email")
        .populate("createdBy", "_id firstname lastname email");
      res.status(200).json(events);
    } catch (err) {
      next(err);
    }
  },

  getEventsByUser: async (req, res, next) => {
    try {
      const events = await CalendarEvent.find({
        participants: req.params.userId,
        isDeleted: false,
      }).populate("matter", "_id title matterNumber");
      res.status(200).json(events);
    } catch (err) {
      next(err);
    }
  },
};
