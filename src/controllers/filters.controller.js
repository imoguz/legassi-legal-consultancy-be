"use strict";

const Task = require("../models/task.model");

module.exports = {
  getTaskFilters: async (req, res, next) => {
    try {
      // Security filters
      let baseFilters = { isDeleted: false };

      if (!["admin", "manager"].includes(req.user.role)) {
        baseFilters.$or = [
          { "assignees.user": req.user.id },
          { createdBy: req.user.id },
          { visibility: { $in: ["internal", "team"] } },
        ];
      }

      // Status
      const statusAggregation = await Task.aggregate([
        { $match: baseFilters },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const statusEnum = [
        "open",
        "in-progress",
        "waiting",
        "completed",
        "cancelled",
      ];
      const statusMap = {
        open: "Open",
        "in-progress": "In Progress",
        waiting: "Waiting",
        completed: "Completed",
        cancelled: "Cancelled",
      };

      const statusOptions = statusEnum.map((status) => {
        const aggItem = statusAggregation.find((item) => item._id === status);
        const count = aggItem ? aggItem.count : 0;
        return {
          text: `${statusMap[status]} (${count})`,
          value: status,
        };
      });

      // Priority
      const priorityAggregation = await Task.aggregate([
        { $match: baseFilters },
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const priorityEnum = ["low", "medium", "high", "urgent"];
      const priorityMap = {
        low: "Low",
        medium: "Medium",
        high: "High",
        urgent: "Urgent",
      };

      const priorityOptions = priorityEnum.map((priority) => {
        const aggItem = priorityAggregation.find(
          (item) => item._id === priority
        );
        const count = aggItem ? aggItem.count : 0;
        return {
          text: `${priorityMap[priority]} (${count})`,
          value: priority,
        };
      });

      // Assignees
      const assigneesAggregation = await Task.aggregate([
        { $match: baseFilters },
        { $unwind: "$assignees" },
        {
          $lookup: {
            from: "users",
            let: { userId: "$assignees.user" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$userId"] },
                },
              },
              {
                $project: {
                  _id: 1,
                  firstname: 1,
                  lastname: 1,
                },
              },
            ],
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $group: {
            _id: "$assignees.user",
            firstname: { $first: "$userInfo.firstname" },
            lastname: { $first: "$userInfo.lastname" },
            count: { $sum: 1 },
          },
        },
        { $match: { firstname: { $ne: null }, lastname: { $ne: null } } },
        { $sort: { firstname: 1, lastname: 1 } },
        {
          $project: {
            _id: 0,
            value: "$_id",
            text: {
              $concat: [
                "$firstname",
                " ",
                "$lastname",
                " (",
                { $toString: "$count" },
                ")",
              ],
            },
            count: 1,
          },
        },
      ]);

      // Unassigned
      const unassignedCount = await Task.countDocuments({
        ...baseFilters,
        assignees: { $size: 0 },
      });

      const assigneesOptions = [
        { text: `Unassigned (${unassignedCount})`, value: "unassigned" },
        ...assigneesAggregation,
      ];

      // Matters
      const mattersAggregation = await Task.aggregate([
        { $match: baseFilters },
        {
          $lookup: {
            from: "matters",
            let: { matterId: "$matter" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$matterId"] },
                      { $eq: ["$isDeleted", false] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  title: 1,
                  matterNumber: 1,
                },
              },
            ],
            as: "matterInfo",
          },
        },
        { $unwind: "$matterInfo" },
        {
          $group: {
            _id: "$matter",
            title: { $first: "$matterInfo.title" },
            matterNumber: { $first: "$matterInfo.matterNumber" },
            count: { $sum: 1 },
          },
        },
        { $sort: { title: 1 } },
        {
          $project: {
            _id: 0,
            value: "$_id",
            text: {
              $cond: {
                if: { $ne: ["$matterNumber", null] },
                then: {
                  $concat: [
                    { $substrCP: ["$title", 0, 18] },
                    ".. - ",
                    "$matterNumber",
                    " (",
                    { $toString: "$count" },
                    ")",
                  ],
                },
                else: {
                  $concat: [
                    { $substrCP: ["$title", 0, 18] },
                    ".. - (",
                    { $toString: "$count" },
                    ")",
                  ],
                },
              },
            },
            count: 1,
          },
        },
      ]);

      // Due Date
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const endOfToday = new Date(startOfToday);
      endOfToday.setHours(23, 59, 59, 999);

      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - dayOfWeek);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const startOfNextWeek = new Date(startOfWeek);
      startOfNextWeek.setDate(startOfWeek.getDate() + 7);

      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
      endOfNextWeek.setHours(23, 59, 59, 999);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const dueDateCounts = await Promise.all([
        // Overdue
        Task.countDocuments({
          ...baseFilters,
          dueDate: { $lt: now },
        }),
        // Today
        Task.countDocuments({
          ...baseFilters,
          dueDate: { $gte: startOfToday, $lte: endOfToday },
        }),
        // This Week
        Task.countDocuments({
          ...baseFilters,
          dueDate: { $gte: startOfWeek, $lte: endOfWeek },
        }),
        // Next Week
        Task.countDocuments({
          ...baseFilters,
          dueDate: { $gte: startOfNextWeek, $lte: endOfNextWeek },
        }),
        // This Month
        Task.countDocuments({
          ...baseFilters,
          dueDate: { $gte: startOfMonth, $lte: endOfMonth },
        }),
      ]);

      const dueDateOptions = [
        { text: `Overdue (${dueDateCounts[0]})`, value: "overdue" },
        { text: `Today (${dueDateCounts[1]})`, value: "today" },
        { text: `This Week (${dueDateCounts[2]})`, value: "week" },
        { text: `Next Week (${dueDateCounts[3]})`, value: "next_week" },
        { text: `This Month (${dueDateCounts[4]})`, value: "month" },
      ];

      // Visibility
      const visibilityAggregation = await Task.aggregate([
        { $match: baseFilters },
        {
          $group: {
            _id: "$visibility",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const visibilityEnum = ["internal", "client", "team", "restricted"];
      const visibilityMap = {
        internal: "Internal",
        client: "Client",
        team: "Team",
        restricted: "Restricted",
      };

      const visibilityOptions = visibilityEnum.map((visibility) => {
        const aggItem = visibilityAggregation.find(
          (item) => item._id === visibility
        );
        const count = aggItem ? aggItem.count : 0;
        return {
          text: `${visibilityMap[visibility]} (${count})`,
          value: visibility,
        };
      });

      res.status(200).json({
        success: true,
        data: {
          status: statusOptions,
          priority: priorityOptions,
          assignees: assigneesOptions,
          matters: mattersAggregation,
          dueDate: dueDateOptions,
          visibility: visibilityOptions,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getMatterFilters: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: {},
      });
    } catch (err) {
      next(err);
    }
  },
};
