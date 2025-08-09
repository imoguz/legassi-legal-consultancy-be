"use strict";

const Contact = require("../models/contact.model");

module.exports = {
  create: async (req, res) => {
    const body = {
      ...req.body,
      createdBy: req.user.id,
    };
    console.log(body);
    const data = await Contact.create(body);
    res.status(201).send(data);
  },

  readOne: async (req, res) => {
    const data = await Contact.findById(req.params.id);

    if (!data) return res.status(404).send({ message: "Contact not found" });

    res.status(200).send(data);
  },

  readMany: async (req, res, next) => {
    try {
      const baseFilters =
        req.user.role === "admin"
          ? { isDeleted: false }
          : { createdBy: req.user.id, isDeleted: false };

      const data = await req.queryHandler(
        Contact,
        null,
        ["fullName", "email", "phone", "companyName"], // searchable fields
        baseFilters
      );

      res.send(data);
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res) => {
    const data = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!data) return res.status(404).send({ message: "Contact not found" });

    res.status(202).send(data);
  },

  _delete: async (req, res, next) => {
    try {
      const contact = await Contact.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

      if (!contact) return res.status(404).send("cContact not found.");

      const isAuthorized =
        req.user.role === "admin" ||
        contact.createdBy.toString() === req.user.id;

      if (!isAuthorized)
        return res
          .status(403)
          .send("You are not authorized to delete this contact.");

      contact.isDeleted = true;
      await contact.save();

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
