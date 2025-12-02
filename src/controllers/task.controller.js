"use strict";

const { createAuditLog } = require("../helpers/audit.helper");
const Task = require("../models/task.model");
const Matter = require("../models/matter.model");
const { notifyUsers } = require("../helpers/notification.helper");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const dayjs = require("dayjs");
const { uploadToCloudinaryBuffer } = require("../helpers/cloudinary");
const Document = require("../models/document.model");

// Helper functions
const getCurrentUser = async (userId) => {
  return await User.findById(userId).select("firstname lastname email");
};

const checkTaskAuthorization = async (task, userId) => {
  const matter = await Matter.findById(task.matter).populate("team");

  if (!matter) return false;

  // Authorization
  const currentUser = await User.findById(userId);
  // Admin and manager
  if (["admin", "manager"].includes(currentUser?.role)) return true;

  // Primary attorney
  if (matter.primaryAttorney?.toString() === userId) return true;

  // Team member
  const isTeamMember = matter.team.some(
    (member) => member.user?.toString() === userId
  );

  // Assignee
  const isAssignee = task.assignees.some(
    (assignee) => assignee.user?.toString() === userId
  );

  return isTeamMember || isAssignee || task.createdBy?.toString() === userId;
};

const getNotificationRecipients = async (task) => {
  const matter = await Matter.findById(task.matter).populate("team");
  if (!matter) return [];

  const recipients = new Set();

  task.assignees.forEach((assignee) => {
    if (assignee.user) recipients.add(assignee.user.toString());
  });

  if (matter.primaryAttorney) {
    recipients.add(matter.primaryAttorney.toString());
  }

  matter.team.forEach((member) => {
    if (member.user) recipients.add(member.user.toString());
  });

  if (task.createdBy) {
    recipients.add(task.createdBy.toString());
  }

  return Array.from(recipients);
};

// File upload helper
const handleFileUpload = async (files, taskId, userId) => {
  const documentIds = [];

  for (const file of files) {
    try {
      const uploadResult = await uploadToCloudinaryBuffer(
        file.buffer,
        file.originalname
      );

      const document = await Document.create({
        filename: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        uploadedBy: userId,
        task: taskId,
      });

      documentIds.push(document._id);
    } catch (fileError) {
      console.error("File upload error:", fileError);
      continue;
    }
  }

  return documentIds;
};

module.exports = {
  create: async (req, res, next) => {
    try {
      const {
        matter,
        title,
        description,
        assignees,
        dueDate,
        priority,
        visibility,
        estimatedMinutes,
        checklist,
        permittedUsers = [],
      } = req.body;
      const files = req.files || [];

      const currentUser = await getCurrentUser(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const relatedMatter = await Matter.findOne({
        _id: matter,
        isDeleted: false,
      });
      if (!relatedMatter) {
        return res.status(404).json({ message: "Matter not found" });
      }

      const isAuthorized = await checkTaskAuthorization(
        { matter, createdBy: req.user.id },
        req.user.id
      );
      if (!isAuthorized) {
        return res
          .status(403)
          .json({ message: "Not authorized to create task for this matter" });
      }

      let parsedAssignees = [];
      let parsedChecklist = [];
      let parsedPermittedUsers = [];

      try {
        parsedAssignees =
          typeof assignees === "string"
            ? JSON.parse(assignees)
            : assignees || [];
        parsedChecklist =
          typeof checklist === "string"
            ? JSON.parse(checklist)
            : checklist || [];
        parsedPermittedUsers =
          typeof permittedUsers === "string"
            ? JSON.parse(permittedUsers)
            : permittedUsers || [];
      } catch (parseError) {
        console.warn("JSON parse error, using empty arrays:", parseError);
        parsedAssignees = assignees || [];
        parsedChecklist = checklist || [];
        parsedPermittedUsers = permittedUsers || [];
      }

      // New Task
      const newTask = await Task.create({
        matter,
        title,
        description: description || "",
        assignees: parsedAssignees,
        dueDate: dueDate || null,
        priority: priority || "medium",
        visibility: visibility || "internal",
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        checklist: parsedChecklist,
        permittedUsers: parsedPermittedUsers,
        createdBy: req.user.id,
      });

      // Add task to matter
      if (!relatedMatter.tasks.includes(newTask._id)) {
        relatedMatter.tasks.push(newTask._id);
        await relatedMatter.save();
      }

      // Handle file uploads
      if (files.length > 0) {
        const documentIds = await handleFileUpload(
          files,
          newTask._id,
          req.user.id
        );
        newTask.attachments = documentIds;
        await newTask.save();
      }

      // Populate the task with attachments
      await newTask.populate("attachments");

      // Audit log
      await createAuditLog({
        collectionName: "tasks",
        documentId: newTask._id,
        changedBy: req.user.id,
        changedFields: Object.keys(req.body).filter(
          (key) => req.body[key] !== undefined
        ),
        operation: "create",
        previousValues: {},
        newValues: newTask.toObject(),
      });

      // Notification
      const recipients = await getNotificationRecipients(newTask);
      if (recipients.length > 0) {
        await notifyUsers({
          recipients,
          title: "New Task Created",
          message: `${currentUser.firstname} ${currentUser.lastname} created a new task: ${title}`,
          type: "task",
          relatedId: newTask._id,
          createdBy: req.user.id,
          metadata: { actionable: true },
        });
      }

      res.status(201).json(newTask);
    } catch (err) {
      console.error("Create task error:", err);
      next(err);
    }
  },

  readMany: async (req, res, next) => {
    try {
      // Custom Filter Handler
      const customFilterHandler = async (clientFilters, req) => {
        const finalFilters = { isDeleted: false };

        if (!["admin", "manager"].includes(req.user.role)) {
          finalFilters.$or = [
            { "assignees.user": req.user.id },
            { createdBy: req.user.id },
            { visibility: { $in: ["internal", "team"] } },
          ];
        }

        Object.keys(clientFilters).forEach((key) => {
          const value = clientFilters[key];

          // DueDate filters
          if (key === "dueDate") {
            const now = dayjs();

            switch (value) {
              case "overdue":
                finalFilters.dueDate = { $lt: new Date() };
                break;
              case "today":
                finalFilters.dueDate = {
                  $gte: now.startOf("day").toDate(),
                  $lte: now.endOf("day").toDate(),
                };
                break;
              case "week":
                finalFilters.dueDate = {
                  $gte: now.startOf("week").toDate(),
                  $lte: now.endOf("week").toDate(),
                };
                break;
              case "next_week":
                finalFilters.dueDate = {
                  $gte: now.add(1, "week").startOf("week").toDate(),
                  $lte: now.add(1, "week").endOf("week").toDate(),
                };
                break;
              case "month":
                finalFilters.dueDate = {
                  $gte: now.startOf("month").toDate(),
                  $lte: now.endOf("month").toDate(),
                };
                break;
              default:
                if (Array.isArray(value)) {
                  if (value.length === 1) {
                    finalFilters.dueDate = new Date(value[0]);
                  } else if (value.length > 1) {
                    finalFilters.dueDate = {
                      $in: value.map((v) => new Date(v)),
                    };
                  }
                } else {
                  finalFilters.dueDate = new Date(value);
                }
            }
          }

          // Assignees filters
          else if (key === "assignees") {
            if (value === "unassigned") {
              finalFilters.assignees = { $size: 0 };
            } else if (value === "assigned") {
              finalFilters.assignees = { $not: { $size: 0 } };
            } else if (Array.isArray(value)) {
              if (value.length === 1) {
                finalFilters["assignees.user"] = value[0];
              } else if (value.length > 1) {
                finalFilters["assignees.user"] = { $in: value };
              }
            } else {
              finalFilters["assignees.user"] = value;
            }
          }

          // Other filters
          else {
            if (Array.isArray(value)) {
              if (value.length === 1) {
                finalFilters[key] = value[0];
              } else if (value.length > 1) {
                finalFilters[key] = { $in: value };
              }
            } else {
              finalFilters[key] = value;
            }
          }
        });

        return finalFilters;
      };

      const tasks = await req.queryHandler(
        Task,
        [
          { path: "matter", select: "_id title matterNumber" },
          {
            path: "assignees.user",
            select: "_id firstname lastname email position profileUrl",
          },
          { path: "createdBy", select: "_id firstname lastname" },
          { path: "attachments" },
        ],
        ["title", "description", "status", "priority"],
        customFilterHandler
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
          path: "assignees.user",
          select: "_id firstname lastname email position profileUrl",
        })
        .populate({
          path: "createdBy",
          select: "_id firstname lastname",
        })
        .populate("attachments");

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const isAuthorized = await checkTaskAuthorization(task, req.user.id);
      if (!isAuthorized) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this task" });
      }

      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  },

  getMatters: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      let matterFilter = { isDeleted: false };

      if (!["admin", "manager"].includes(req.user.role)) {
        matterFilter.$or = [
          { primaryAttorney: req.user.id },
          { "team.user": req.user.id },
          { createdBy: req.user.id },
        ];
      }

      const [matters, total] = await Promise.all([
        Matter.find(matterFilter)
          .select("_id title matterNumber")
          .skip(skip)
          .limit(limit),
        Matter.countDocuments(matterFilter),
      ]);

      res.status(200).json({
        data: matters,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  getTasksByMatter: async (req, res, next) => {
    try {
      const matter = await Matter.findOne({
        _id: req.params.matterId,
        isDeleted: false,
      });

      if (!matter) {
        return res.status(404).json({ message: "Matter not found" });
      }

      const baseFilters = {
        isDeleted: false,
        matter: req.params.matterId,
      };

      const tasks = await req.queryHandler(
        Task,
        [
          { path: "matter", select: "_id title matterNumber" },
          {
            path: "assignees.user",
            select: "_id firstname lastname email position profileUrl",
          },
        ],
        ["title", "status", "priority"],
        baseFilters
      );

      res.status(200).json(tasks);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const {
        title,
        description,
        assignees,
        dueDate,
        priority,
        visibility,
        status,
        estimatedMinutes,
        checklist,
        permittedUsers = [],
        deletedAttachments,
      } = req.body;
      const files = req.files || [];

      const task = await Task.findOne({
        _id: req.params.id,
        isDeleted: false,
      }).populate("matter");

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const currentUser = await getCurrentUser(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const isAuthorized = await checkTaskAuthorization(task, req.user.id);
      if (!isAuthorized) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this task" });
      }

      let parsedAssignees = task.assignees;
      let parsedChecklist = task.checklist;
      let parsedPermittedUsers = task.permittedUsers;

      try {
        if (assignees !== undefined) {
          parsedAssignees =
            typeof assignees === "string" ? JSON.parse(assignees) : assignees;
        }
        if (checklist !== undefined) {
          parsedChecklist =
            typeof checklist === "string" ? JSON.parse(checklist) : checklist;
        }
        if (permittedUsers !== undefined) {
          parsedPermittedUsers =
            typeof permittedUsers === "string"
              ? JSON.parse(permittedUsers)
              : permittedUsers;
        }
      } catch (parseError) {
        console.warn("JSON parse error in update:", parseError);
      }

      const changedFields = [];
      const previousValues = {};
      const newValues = {};

      const updateFields = {
        title,
        description,
        assignees: parsedAssignees,
        dueDate,
        priority,
        visibility,
        status,
        estimatedMinutes: estimatedMinutes
          ? parseInt(estimatedMinutes)
          : task.estimatedMinutes,
        checklist: parsedChecklist,
        permittedUsers: parsedPermittedUsers,
      };

      Object.keys(updateFields).forEach((key) => {
        if (
          updateFields[key] !== undefined &&
          JSON.stringify(task[key]) !== JSON.stringify(updateFields[key])
        ) {
          changedFields.push(key);
          previousValues[key] = task[key];
          newValues[key] = updateFields[key];
          task[key] = updateFields[key];
        }
      });

      // Handle file uploads
      if (files.length > 0) {
        const documentIds = await handleFileUpload(
          files,
          task._id,
          req.user.id
        );
        task.attachments.push(...documentIds);
        if (!changedFields.includes("attachments")) {
          changedFields.push("attachments");
        }
      }

      // Handle deleted attachments
      if (deletedAttachments && deletedAttachments !== "[]") {
        let deletedAttachmentIds = [];
        try {
          if (Array.isArray(deletedAttachments)) {
            deletedAttachmentIds = deletedAttachments;
          } else if (typeof deletedAttachments === "string") {
            deletedAttachmentIds = JSON.parse(deletedAttachments);
          }
        } catch (error) {
          console.warn("Error parsing deletedAttachments:", error);
          if (
            typeof deletedAttachments === "string" &&
            deletedAttachments.length === 24
          ) {
            deletedAttachmentIds = [deletedAttachments];
          }
        }

        if (deletedAttachmentIds.length > 0) {
          task.attachments = task.attachments.filter(
            (attachmentId) =>
              !deletedAttachmentIds.includes(attachmentId.toString())
          );
          if (!changedFields.includes("attachments")) {
            changedFields.push("attachments");
          }

          // Delete documents from database
          await Document.deleteMany({ _id: { $in: deletedAttachmentIds } });
        }
      }

      if (status === "completed" && !task.completedAt) {
        task.completedAt = new Date();
      } else if (status !== "completed" && task.completedAt) {
        task.completedAt = null;
      }

      await task.save();
      await task.populate("attachments");

      // Audit log
      if (changedFields.length > 0) {
        await createAuditLog({
          collectionName: "tasks",
          documentId: task._id,
          changedBy: req.user.id,
          changedFields,
          operation: "update",
          previousValues,
          newValues: newValues,
        });

        // Notification
        const recipients = await getNotificationRecipients(task);
        if (recipients.length > 0) {
          await notifyUsers({
            recipients,
            title: "Task Updated",
            message: `${currentUser.firstname} ${currentUser.lastname} updated task: ${task.title}`,
            type: "task",
            relatedId: task._id,
            createdBy: req.user.id,
            metadata: { actionable: true },
          });
        }
      }

      res.status(200).json(task);
    } catch (err) {
      console.error("Update task error:", err);
      next(err);
    }
  },

  _delete: async (req, res, next) => {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        isDeleted: false,
      }).populate("matter");

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const currentUser = await getCurrentUser(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const isAuthorized = await checkTaskAuthorization(task, req.user.id);
      if (!isAuthorized) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this task" });
      }

      const previousValues = { isDeleted: task.isDeleted };
      task.isDeleted = true;
      await task.save();

      // Remove deleted task from  the matter atter
      const matter = await Matter.findById(task.matter);
      if (matter) {
        matter.tasks = matter.tasks.filter(
          (taskId) => taskId.toString() !== task._id.toString()
        );
        await matter.save();
      }

      await Notification.updateMany(
        {
          relatedId: task._id,
          type: "task",
          "metadata.actionable": true,
        },
        {
          $set: {
            "metadata.actionable": false,
            "metadata.operation": "task_deleted",
            "metadata.deletedAt": new Date(),
            "metadata.deletedBy": req.user.id,
          },
        }
      );

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

      // Notification
      const recipients = await getNotificationRecipients(task);
      if (recipients.length > 0) {
        await notifyUsers({
          recipients,
          title: "Task Deleted",
          message: `${currentUser.firstname} ${currentUser.lastname} deleted task: ${task.title}`,
          type: "task",
          relatedId: task._id,
          createdBy: req.user.id,
          metadata: {
            actionable: false,
            originalTitle: task.title,
            operation: "delete",
          },
        });
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  purge: async (req, res, next) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can purge tasks" });
      }

      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      const currentUser = await getCurrentUser(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove deleted task from the matter
      const matter = await Matter.findById(task.matter);
      if (matter) {
        matter.tasks = matter.tasks.filter(
          (taskId) => taskId.toString() !== task._id.toString()
        );
        await matter.save();
      }

      await Notification.updateMany(
        {
          relatedId: task._id,
          type: "task",
        },
        {
          $set: {
            "metadata.actionable": false,
            "metadata.operation": "task_purged",
            "metadata.purgedAt": new Date(),
            "metadata.purgedBy": req.user.id,
          },
        }
      );

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

      // Notification
      const recipients = await getNotificationRecipients(task);
      if (recipients.length > 0) {
        await notifyUsers({
          recipients,
          title: "Task Purged",
          message: `${currentUser.firstname} ${currentUser.lastname} permanently deleted task: ${task.title}`,
          type: "task",
          relatedId: task._id,
          createdBy: req.user.id,
          metadata: {
            actionable: false,
            originalTitle: task.title,
            operation: "purge",
          },
        });
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  getTaskStats: async (req, res, next) => {
    try {
      let baseFilters = { isDeleted: false };

      if (!["admin", "manager"].includes(req.user.role)) {
        baseFilters.$or = [
          { "assignees.user": req.user.id },
          { createdBy: req.user.id },
          { visibility: { $in: ["internal", "team"] } },
        ];
      }

      const tasks = await Task.find(baseFilters);

      const stats = {
        total: tasks.length,
        open: tasks.filter((task) => task.status === "open").length,
        inProgress: tasks.filter((task) => task.status === "in-progress")
          .length,
        completed: tasks.filter((task) => task.status === "completed").length,
        overdue: tasks.filter(
          (task) =>
            task.dueDate &&
            dayjs(task.dueDate).isBefore(dayjs()) &&
            !["completed", "cancelled"].includes(task.status)
        ).length,
      };

      res.status(200).json(stats);
    } catch (err) {
      next(err);
    }
  },
};
