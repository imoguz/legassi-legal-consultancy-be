"use strict";

const Matter = require("../models/matter.model");
const Task = require("../models/task.model");
const Document = require("../models/document.model");
const User = require("../models/user.model");

module.exports = {
  getMatterReport: async (req, res, next) => {
    try {
      const statusSummary = await Matter.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const typeSummary = await Matter.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$matterType", count: { $sum: 1 } } },
      ]);

      const feeSummary = await Matter.aggregate([
        { $match: { isDeleted: false, feeAmount: { $gt: 0 } } },
        { $group: { _id: "$feeType", total: { $sum: "$feeAmount" } } },
      ]);

      res.status(200).json({ statusSummary, typeSummary, feeSummary });
    } catch (err) {
      next(err);
    }
  },

  getTaskReport: async (req, res, next) => {
    try {
      const statusSummary = await Task.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const userSummary = await Task.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$assignedTo", tasks: { $sum: 1 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            tasks: 1,
            "user.firstname": 1,
            "user.lastname": 1,
            "user.email": 1,
          },
        },
      ]);

      res.status(200).json({ statusSummary, userSummary });
    } catch (err) {
      next(err);
    }
  },

  getDocumentReport: async (req, res, next) => {
    try {
      const categorySummary = await Document.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]);

      const userSummary = await Document.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$uploadedBy", docs: { $sum: 1 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            docs: 1,
            "user.firstname": 1,
            "user.lastname": 1,
            "user.email": 1,
          },
        },
      ]);

      res.status(200).json({ categorySummary, userSummary });
    } catch (err) {
      next(err);
    }
  },

  getUserReport: async (req, res, next) => {
    try {
      const roleSummary = await User.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]);

      res.status(200).json({ roleSummary });
    } catch (err) {
      next(err);
    }
  },
};
