const { Schema, model } = require("mongoose");

const tokenBlacklistSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    collection: "tokenBlacklist",
    timestamps: true,
  }
);

// TTL index for auto delete at mongoDB
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = model("TokenBlacklist", tokenBlacklistSchema);
