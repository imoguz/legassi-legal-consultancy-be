"use strict";

const mongoose = require("mongoose");
const dayjs = require("dayjs");
const Matter = require("../models/matter.model");
require("dotenv").config();

// MongoDB
const MONGO_URI = process.env.MONGODB;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Ids
const userIds = [
  "683199ea0c0715b42e646395",
  "687d65e5d02427d8a3b7680e",
  "68a58149adcb80183df8ed7a",
  "68a5818aadcb80183df8ed7e",
  "68a581c1adcb80183df8ed82",
];

// Client Ids
const clientIds = [
  "692ebe08757fb0ee12d30baf",
  "692ebdb7757fb0ee12d30ba8",
  "692ebd7a757fb0ee12d30ba1",
  "692ebce6757fb0ee12d30b95",
  "692ebcaf757fb0ee12d30b8e",
  "692ebc81757fb0ee12d30b87",
  "692ebc58757fb0ee12d30b80",
  "692ebbcd757fb0ee12d30b76",
];

// Random select
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Random date
const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Random team member
const generateTeam = () => {
  const shuffled = userIds.sort(() => 0.5 - Math.random());
  const team = shuffled.slice(0, 2).map((id) => ({
    user: id,
    role: randomItem(["attorney", "partner", "paralegal", "assistant"]),
    isPrimary: Math.random() > 0.5,
    assignedBy: randomItem(userIds),
  }));
  return team;
};

// Create Matter
const generateMatter = (index) => ({
  title: `Test Matter ${index + 1}`,
  description: "This is a test record",
  matterNumber: `MAT-${1000 + index}`,
  practiceArea: randomItem(["Corporate", "Criminal", "Civil", "IP"]),
  status: randomItem(["open", "in-progress", "on-hold", "closed"]),
  stage: randomItem([
    "intake",
    "preparation",
    "filing",
    "discovery",
    "hearing",
    "trial",
    "appeal",
    "complete",
  ]),
  priority: randomItem(["low", "medium", "high", "urgent"]),
  client: randomItem(clientIds),
  primaryAttorney: randomItem(userIds),
  team: generateTeam(),
  visibility: randomItem(["internal", "team", "client", "restricted"]),
  createdBy: randomItem(userIds),
  modifiedBy: randomItem(userIds),
  isDeleted: false,
  dates: {
    openingDate: randomDate(new Date(2023, 0, 1), new Date()),
    deadline: randomDate(new Date(), dayjs().add(3, "month").toDate()),
  },
  billing: {
    billingModel: randomItem(["hourly", "flat", "contingency", "mixed"]),
    hourlyRate: Math.floor(Math.random() * 200) + 50,
    currency: "USD",
  },
  financials: {
    totalBilled: 0,
    totalPaid: 0,
    outstanding: 0,
    retainerBalance: 0,
  },
});

// 50 matters
const seedMatters = async () => {
  try {
    const matters = [];
    for (let i = 0; i < 50; i++) {
      matters.push(generateMatter(i));
    }

    await Matter.insertMany(matters);
    console.log("50 test matter added succesfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error:", err);
    mongoose.connection.close();
  }
};

seedMatters();
