"use strict";

async function sendPromptToDocumentAIService(prompt) {
  const mockMatched = [{ id: "68a8336a5c3d0dec522a1762", weight: 0.76 }];

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
