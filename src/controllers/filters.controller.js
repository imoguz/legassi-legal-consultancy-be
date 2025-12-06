"use strict";

const Task = require("../models/task.model");
const Matter = require("../models/matter.model");

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
      // Security filters
      let baseFilters = { isDeleted: false };

      if (!["admin", "manager"].includes(req.user.role)) {
        baseFilters.$or = [
          { primaryAttorney: req.user.id },
          { "team.user": req.user.id },
          { permittedUsers: req.user.id },
        ];
      }

      // Status
      const statusAggregation = await Matter.aggregate([
        { $match: baseFilters },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const statusEnum = ["open", "active", "pending", "closed", "archived"];
      const statusMap = {
        open: "Open",
        active: "Active",
        pending: "Pending",
        closed: "Closed",
        archived: "Archived",
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
      const priorityAggregation = await Matter.aggregate([
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

      // Primary Attorney
      const attorneyAggregation = await Matter.aggregate([
        { $match: baseFilters },
        {
          $lookup: {
            from: "users",
            let: { attorneyId: "$primaryAttorney" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", "$$attorneyId"] },
                  isActive: true,
                },
              },
              {
                $project: {
                  _id: 1,
                  firstname: 1,
                  lastname: 1,
                  email: 1,
                },
              },
            ],
            as: "attorneyInfo",
          },
        },
        { $unwind: "$attorneyInfo" },
        {
          $group: {
            _id: "$primaryAttorney",
            firstname: { $first: "$attorneyInfo.firstname" },
            lastname: { $first: "$attorneyInfo.lastname" },
            count: { $sum: 1 },
          },
        },
        { $sort: { firstname: 1 } },
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
          },
        },
      ]);

      // Practice Area
      const practiceAreaAggregation = await Matter.aggregate([
        { $match: baseFilters },
        { $match: { practiceArea: { $ne: null, $ne: "" } } },
        {
          $group: {
            _id: "$practiceArea",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const practiceAreaOptions = practiceAreaAggregation.map((item) => ({
        text: `${item._id} (${item.count})`,
        value: item._id,
      }));

      // Stage
      const stageAggregation = await Matter.aggregate([
        { $match: baseFilters },
        {
          $group: {
            _id: "$stage",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const stageEnum = [
        "intake",
        "investigation",
        "pleading",
        "discovery",
        "pretrial",
        "trial",
        "appeal",
        "closed",
      ];

      const stageOptions = stageEnum.map((stage) => {
        const aggItem = stageAggregation.find((item) => item._id === stage);
        const count = aggItem ? aggItem.count : 0;
        return {
          text: `${stage.charAt(0).toUpperCase() + stage.slice(1)} (${count})`,
          value: stage,
        };
      });

      // Team Members (Assigned/Unassigned)
      const teamCount = await Matter.countDocuments({
        ...baseFilters,
        team: { $exists: true, $not: { $size: 0 } },
      });

      const unassignedCount = await Matter.countDocuments({
        ...baseFilters,
        $or: [{ team: { $exists: false } }, { team: { $size: 0 } }],
      });

      const teamOptions = [
        { text: `Assigned (${teamCount})`, value: "assigned" },
        { text: `Unassigned (${unassignedCount})`, value: "unassigned" },
      ];

      // Opening Date Ranges
      const now = new Date();
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

      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999
      );

      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      const openingDateCounts = await Promise.all([
        // This Month
        Matter.countDocuments({
          ...baseFilters,
          "dates.openingDate": { $gte: startOfMonth, $lte: endOfMonth },
        }),
        // Last Month
        Matter.countDocuments({
          ...baseFilters,
          "dates.openingDate": { $gte: startOfLastMonth, $lte: endOfLastMonth },
        }),
        // This Year
        Matter.countDocuments({
          ...baseFilters,
          "dates.openingDate": { $gte: startOfYear, $lte: endOfYear },
        }),
        // Older than 1 year
        Matter.countDocuments({
          ...baseFilters,
          "dates.openingDate": { $lt: startOfYear },
        }),
      ]);

      const openingDateOptions = [
        { text: `This Month (${openingDateCounts[0]})`, value: "this_month" },
        { text: `Last Month (${openingDateCounts[1]})`, value: "last_month" },
        { text: `This Year (${openingDateCounts[2]})`, value: "this_year" },
        { text: `Older (${openingDateCounts[3]})`, value: "older" },
      ];

      res.status(200).json({
        success: true,
        data: {
          status: statusOptions,
          priority: priorityOptions,
          primaryAttorney: attorneyAggregation,
          practiceArea: practiceAreaOptions,
          stage: stageOptions,
          teamMembers: teamOptions,
          openingDate: openingDateOptions,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
