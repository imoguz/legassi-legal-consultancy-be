const AuditLog = require("../models/auditLog.model");

async function createAuditLog({
  collectionName,
  documentId,
  changedBy,
  changedFields = [],
  operation,
  previousValues = {},
  newValues = {},
}) {
  try {
    await AuditLog.create({
      collectionName,
      documentId,
      changedBy,
      changedFields,
      operation,
      previousValues,
      newValues,
    });
  } catch (err) {
    console.error("Audit log could not be written:", err);
  }
}

module.exports = { createAuditLog };
