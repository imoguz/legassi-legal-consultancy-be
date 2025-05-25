"use strict";

const axios = require("axios");

async function sendQueryToAIService(query) {
  //   const response = await axios.post(
  //     process.env.AI_SERVICE_URL,
  //     { query },
  //     {
  //       headers: {
  //         Authorization: `Bearer ${process.env.AI_SERVICE_KEY}`,
  //       },
  //     }
  //   );
  //   return response.data;

  const response = {
    answer: `This is a placeholder answer: Alimony is typically calculated based on several factors, including the length of the marriage, the income and financial needs of each spouse, the standard of living during the marriage, and each spouse’s ability to support themselves. Courts may also consider child custody arrangements and any prenuptial agreements.`,
    confidence: 0.95,
    source: "mock",
  };

  return response;
}

module.exports = { sendQueryToAIService };
