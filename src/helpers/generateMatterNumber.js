const Matter = require("../models/matter.model");

async function generateMatterNumber() {
  const year = new Date().getFullYear();
  const prefix = `MAT-${year}-`;
  const count = await Matter.countDocuments({
    matterNumber: { $regex: `^${prefix}` },
  });
  const padded = String(count + 1).padStart(4, "0");
  return `${prefix}${padded}`;
}
module.exports = generateMatterNumber;
