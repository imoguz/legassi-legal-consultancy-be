function generateSessionTitle(chunks, userPrompt) {
  if (!Array.isArray(chunks)) {
    return userPrompt ? truncateTitle(userPrompt) : "AI Chat";
  }

  let fullText = "";
  const contentChunks = chunks.filter(
    (chunk) => chunk.type === "content" && chunk.content
  );

  for (let i = 0; i < Math.min(3, contentChunks.length); i++) {
    fullText += contentChunks[i].content + " ";
  }

  if (!fullText.trim()) {
    return userPrompt ? truncateTitle(userPrompt) : "AI Chat";
  }

  const sentences = fullText
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 10);
  if (sentences.length > 0) {
    return truncateTitle(sentences[0]);
  }

  return truncateTitle(fullText);
}

function truncateTitle(text, maxWords = 6) {
  const words = text.split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(" ");
}

module.exports = generateSessionTitle;
