"use strict";

async function sendPromptToDocumentAIService(prompt) {
  const mockMatched = [
    { id: "683969d556e03dc267a2f281", weight: 0.76 },
    { id: "6838c21fccb0a3b3212b7f10", weight: 0.68 },
    { id: "6838c219ccb0a3b3212b7f0e", weight: 0.93 },
    { id: "6838c213ccb0a3b3212b7f0c", weight: 0.55 },
    { id: "6838c20cccb0a3b3212b7f0a", weight: 0.82 },
    { id: "6838c206ccb0a3b3212b7f08", weight: 0.71 },
    { id: "6838c200ccb0a3b3212b7f06", weight: 0.64 },
    { id: "6838c1f9ccb0a3b3212b7f04", weight: 0.89 },
    { id: "6838c1f4ccb0a3b3212b7f02", weight: 0.77 },
    { id: "6838c1edccb0a3b3212b7f00", weight: 0.91 },
    { id: "6838c1e5ccb0a3b3212b7efe", weight: 0.58 },
    { id: "6838c1e1ccb0a3b3212b7efc", weight: 0.83 },
    { id: "6838c1dbccb0a3b3212b7efa", weight: 0.72 },
    { id: "6838c1d3ccb0a3b3212b7ef8", weight: 0.65 },
    { id: "6838c1c8ccb0a3b3212b7ef6", weight: 0.94 },
    { id: "6838c1c3ccb0a3b3212b7ef4", weight: 0.69 },
    { id: "6838c1bbccb0a3b3212b7ef2", weight: 0.81 },
    { id: "6838c1b0ccb0a3b3212b7ef0", weight: 0.56 },
    { id: "6838c1a4ccb0a3b3212b7eee", weight: 0.75 },
    { id: "6838c056ccb0a3b3212b7eeb", weight: 0.88 },
    { id: "6838c049ccb0a3b3212b7ee9", weight: 0.62 },
    { id: "6838c03fccb0a3b3212b7ee7", weight: 0.79 },
    { id: "6838c033ccb0a3b3212b7ee5", weight: 0.67 },
    { id: "6838c027ccb0a3b3212b7ee3", weight: 0.84 },
    { id: "6838c01cccb0a3b3212b7ee1", weight: 0.73 },
    { id: "6838c00bccb0a3b3212b7edf", weight: 0.59 },
    { id: "68377f7c80994e3e2df61ef7", weight: 0.85 },
  ];

  // randomly shuffle the matched documents and return 10 documents
  const shuffled = mockMatched
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  const minCount = 5;
  const maxCount = mockMatched.length;
  const randomCount =
    Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;

  const randomMatched = shuffled.slice(0, randomCount);

  return randomMatched;
}

module.exports = { sendPromptToDocumentAIService };
