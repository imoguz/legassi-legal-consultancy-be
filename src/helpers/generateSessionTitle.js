function generateSessionTitle(text) {
  if (!text || typeof text !== "string") return "AI Chat";

  const firstSentence = text.split(".")[0].trim();
  const wordArray = firstSentence.split(" ").filter(Boolean);

  if (wordArray.length < 1) return "AI Chat";

  const slicedWords = wordArray.slice(0, 8).join(" ");
  return slicedWords;
}

module.exports = generateSessionTitle;
