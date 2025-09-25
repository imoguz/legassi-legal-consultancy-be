"use strict";

const PERMISSIONS = {
  // User
  CREATE_USER: ["admin", "manager"],
  VIEW_USER: ["admin", "manager", "staff", "client"],
  LIST_STAFF: ["admin", "manager", "staff"],
  UPDATE_USER: ["admin", "manager", "staff", "client"],
  DELETE_USER: ["admin"],
  LIST_USERS: ["admin"],

  //matter
  CREATE_MATTER: ["admin", "manager", "staff"],
  VIEW_MATTER: ["admin", "manager", "staff"],
  UPDATE_MATTER: ["admin", "manager", "staff"],
  LIST_MATTERS: ["admin", "manager", "staff"],
  DELETE_MATTER: ["admin"],

  // Purge
  PURGE_RECORD: ["admin"],

  // Employee
  CREATE_EMPLOYEE: ["admin", "manager"],
  VIEW_EMPLOYEE: ["admin", "manager", "staff", "client"],
  UPDATE_EMPLOYEE: ["admin", "manager", "staff", "client"],
  DELETE_EMPLOYEE: ["admin"],
  LIST_EMPLOYEES: ["admin"],

  // Document
  CREATE_DOCUMENT: ["admin", "manager", "staff"],
  VIEW_DOCUMENT: ["admin", "manager", "staff", "client"],
  UPDATE_DOCUMENT: ["admin", "manager", "staff"],
  DELETE_DOCUMENT: ["admin", "manager", "staff"],
  LIST_DOCUMENTS: ["admin", "manager", "staff"],

  // Contact
  CREATE_CONTACT: ["admin", "manager", "staff"],
  VIEW_CONTACT: ["admin", "manager", "staff"],
  UPDATE_CONTACT: ["admin", "manager", "staff"],
  DELETE_CONTACT: ["admin", "manager", "staff"],
  LIST_CONTACTS: ["admin", "manager", "staff"],

  // Tasks
  CREATE_TASK: ["admin", "manager", "staff"],
  VIEW_TASK: ["admin", "manager", "staff"],
  UPDATE_TASK: ["admin", "manager", "staff"],
  DELETE_TASK: ["admin", "manager", "staff"],
  LIST_TASKS: ["admin", "manager", "staff"],
  LIST_MATTERS: ["admin", "manager", "staff"],

  // Calendar Events
  CREATE_CALENDAR_EVENT: ["admin", "manager", "staff"],
  VIEW_CALENDAR_EVENT: ["admin", "manager", "staff"],
  UPDATE_CALENDAR_EVENT: ["admin", "manager", "staff"],
  DELETE_CALENDAR_EVENT: ["admin", "manager", "staff"],
  LIST_CALENDAR_EVENTS: ["admin", "manager", "staff"],

  // Reports
  VIEW_REPORTS: ["admin", "manager", "staff"],
};

module.exports = PERMISSIONS;
