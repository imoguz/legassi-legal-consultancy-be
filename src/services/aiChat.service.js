"use strict";

const axios = require("axios");

async function sendPromptToAIService(prompt) {
  // try {
  //   const response = await axios.post(
  //     process.env.AI_SERVICE_URL,
  //     { prompt },
  //     {
  //       headers: {
  //         Authorization: `Bearer ${process.env.AI_SERVICE_KEY}`,
  //       },
  //     }
  //   );

  //   return response.data;
  // } catch (err) {
  //   console.error("AI Service Error:", err.message);
  //   return { text: "AI service not available", weight: 0 };
  // }

  const mockResponses = [
    {
      text: "Alimony is calculated based on duration, income, and needs.",
      weight: 0.91,
    },
    {
      text: "Courts consider prenuptial agreements when awarding alimony.",
      weight: 0.87,
    },
    {
      text: "Spouse’s ability to support themselves affects alimony.",
      weight: 0.93,
    },
    {
      text: "Standard of living during marriage is key in alimony.",
      weight: 0.9,
    },
    {
      text: "Child custody can influence alimony decisions.",
      weight: 0.89,
    },
  ];

  function getRandomMockResponse() {
    const index = Math.floor(Math.random() * mockResponses.length);
    return mockResponses[index];
  }

  return getRandomMockResponse();
  return response;
}

module.exports = { sendPromptToAIService };
