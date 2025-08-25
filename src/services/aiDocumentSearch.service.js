"use strict";

async function sendPromptToDocumentAIService(prompt) {
  const mockMatched = [
    { id: "689ede9eb732c35036a92c50", weight: 0.94 },
    { id: "689ede81b732c35036a92c4e", weight: 0.76 },
    { id: "689ede65b732c35036a92c4c", weight: 0.38 },
    { id: "689ede46b732c35036a92c4a", weight: 0.69 },
    { id: "689ede2bb732c35036a92c48", weight: 0.84 },
    { id: "689edde8b732c35036a92c3d", weight: 0.79 },
  ];

  // randomly shuffle the matched documents and return 5 documents
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
