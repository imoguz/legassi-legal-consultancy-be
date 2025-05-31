"use strict";

const { sendQueryToAIService } = require("../services/aiSearch.service");
const AISearch = require("../models/ai-search.model");

module.exports = {
  search: async (req, res) => {
    try {
      const { query } = req.body;
      const userId = req.user?.id;

      if (!query) {
        return res.status(400).send({ error: "Query is required." });
      }

      const aiResponse = await sendQueryToAIService(query);

      // save query history
      if (userId) {
        await AISearch.create({
          userId,
          query,
          response: aiResponse,
        });
      }

      res.status(200).send({ result: aiResponse });
    } catch (err) {
      res.status(500).send({ error: "AI search failed." });
    }
  },

  getUserQueries: async (req, res) => {
    try {
      req.query.filters = {
        ...(req.query.filters || {}),
        userId: req.user.id,
      };

      const result = await req.queryHandler(AISearch, null, ["query"]);

      res.status(200).send(result);
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Failed to fetch queries." });
    }
  },
};
