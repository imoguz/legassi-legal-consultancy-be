"use strict";

const Matter = require("../models/matter.model");

module.exports = {
  create: async (req, res, next) => {
    try {
      const {
        title,
        client,
        matterType,
        description,
        tags,
        matterNumber,
        teamMembers,
        status,
        feeType,
        importantDates,
        court,
        opposingParty,
      } = req.body;

      const data = await Matter.create({
        title,
        client,
        assignedAttorney: req.user.id,
        matterType,
        description,
        matterNumber,
        status,
        court,
        opposingParty,
        feeType,
        teamMembers,
        tags,
        importantDates: {
          deadline: importantDates?.deadline,
          openingDate: importantDates?.openingDate || new Date(),
        },
        createdBy: req.user.id,
      });

      res.status(201).send(data);
    } catch (err) {
      next(err);
    }
  },

  readMany: async (req, res, next) => {
    try {
      const baseFilters =
        req.user.role === "admin"
          ? { isDeleted: false }
          : { assignedAttorney: req.user.id, isDeleted: false };

      const data = await req.queryHandler(
        Matter,
        ["client", "assignedAttorney"],
        ["title", "tags", "matterType", "status"], // searchable fields
        baseFilters
      );

      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  },

  readOne: async (req, res, next) => {
    try {
      const matter = await Matter.findOne({
        _id: req.params.id,
        isDeleted: false,
      }).populate("client assignedAttorney teamMembers");

      if (!matter) return res.status(404).send("Matter not found.");

      const isAuthorized =
        req.user.role === "admin" ||
        matter.assignedAttorney.toString() === req.user.id ||
        matter.teamMembers.some((id) => id.toString() === req.user.id);

      if (!isAuthorized)
        return res
          .status(403)
          .send("You are not authorized to access this matter.");

      res.status(200).send(matter);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const matter = await Matter.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

      if (!matter) return res.status(404).send("Matter not found.");

      const isAuthorized =
        req.user.role === "admin" ||
        matter.assignedAttorney.toString() === req.user.id;

      if (!isAuthorized)
        return res
          .status(403)
          .send("You are not authorized to update this matter.");

      Object.assign(matter, req.body);
      await matter.save();

      res.status(200).send(matter);
    } catch (err) {
      next(err);
    }
  },

  _delete: async (req, res, next) => {
    try {
      const matter = await Matter.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

      if (!matter) return res.status(404).send("Matter not found.");

      const isAuthorized =
        req.user.role === "admin" ||
        matter.assignedAttorney.toString() === req.user.id;

      if (!isAuthorized)
        return res
          .status(403)
          .send("You are not authorized to delete this matter.");

      matter.isDeleted = true;
      await matter.save();

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
