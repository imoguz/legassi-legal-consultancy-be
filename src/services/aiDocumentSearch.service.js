"use strict";

async function sendPromptToDocumentAIService(prompt) {
  const mockMatched = [
    { id: "689b3fae4105d80b5db84ebb", weight: 0.76 },
    { id: "689b3cc177cdfbe50a579d1f", weight: 0.68 },
    { id: "689b3bf69c593b2ebdb85f9d", weight: 0.93 },
    { id: "689b3b5d9c593b2ebdb85f9b", weight: 0.55 },
    { id: "689b37d0f468d5111f1bc056", weight: 0.82 },
  ];

  // randomly shuffle the matched documents and return 5 documents
  const shuffled = mockMatched
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  const minCount = 4;
  const maxCount = mockMatched.length;
  const randomCount =
    Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;

  const randomMatched = shuffled.slice(0, randomCount);

  return randomMatched;
}

module.exports = { sendPromptToDocumentAIService };
