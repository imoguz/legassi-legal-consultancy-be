"use strict";

const mongoose = require("mongoose");
const dayjs = require("dayjs");
const Task = require("../models/task.model");
require("dotenv").config();

// MongoDB bağlantısı
const MONGO_URI = process.env.MONGODB;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Kullanılacak User Id’leri
const userIds = [
  "683199ea0c0715b42e646395",
  "687d65e5d02427d8a3b7680e",
  "68a58149adcb80183df8ed7a",
  "68a5818aadcb80183df8ed7e",
  "68a581c1adcb80183df8ed82",
];

// Matters
const matterIds = [
  "69190e3b7dc69e56124970ab",
  "692ec07801198627ae877e92",
  "692ec07801198627ae877e93",
  "692ec07801198627ae877e94",
  "692ec07801198627ae877e95",
  "692ec07801198627ae877e96",
  "692ec07801198627ae877e97",
  "692ec07801198627ae877e99",
  "692ec07801198627ae877e9b",
];

// Helper: rastgele assignees
const generateAssignees = () => {
  const shuffled = userIds.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2).map((id) => ({
    user: id,
    isPrimary: Math.random() > 0.5,
  }));
};

// Helper: rastgele seçim
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper: rastgele tarih
const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Task oluştur
const generateTask = () => ({
  matter: randomItem(matterIds),
  title: `Test Task ${Math.floor(Math.random() * 1000)}`,
  description: "Bu bir test kaydıdır.",
  assignees: Math.random() > 0.5 ? generateAssignees() : [],
  dueDate: randomDate(new Date(), dayjs().add(2, "month").toDate()),
  status: randomItem([
    "open",
    "in-progress",
    "waiting",
    "completed",
    "cancelled",
  ]),
  priority: randomItem(["low", "medium", "high", "urgent"]),
  visibility: randomItem(["internal", "client", "team", "restricted"]),
  createdBy: randomItem(userIds),
  modifiedBy: randomItem(userIds),
  isDeleted: false,
  checklist: [
    { title: "Checklist item 1", completed: Math.random() > 0.5 },
    { title: "Checklist item 2", completed: Math.random() > 0.5 },
  ],
  estimatedMinutes: Math.floor(Math.random() * 120),
  actualMinutes: Math.floor(Math.random() * 120),
});

// 50 task ekle
const seedTasks = async () => {
  try {
    const tasks = [];
    for (let i = 0; i < 50; i++) {
      tasks.push(generateTask());
    }

    await Task.insertMany(tasks);
    console.log("50 test task başarıyla eklendi!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Hata:", err);
    mongoose.connection.close();
  }
};

// Çalıştır
seedTasks();
