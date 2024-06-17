const express = require("express");
const auth = require("../routes/auth");
const users = require("../routes/users");
const categories = require("../routes/categories");
// const events = require("../routes/events");
// const livestock = require("../routes/livestock");
// const inventory = require("../routes/inventory");
// const messages = require("../routes/messages");
// const conversations = require("../routes/conversations");
const menu = require("../routes/menu");

//const users = require("../routes/users");
const delivery = require("../routes/delivery");
//const users = require("../routes/users");

const products = require("../routes/products");
const email = require("../routes/email");
// const roles = require("../routes/roles");
const upload = require("../routes/upload");

const error = require("../middleware/error");
module.exports = function (app) {
  app.use(express.json());
  app.use("/api/auth", auth);
  app.use("/api/users", users);
  app.use("/api/email", email);

  // app.use("/api/livestocks", livestock);
  // app.use("/api/events", events);
  // app.use("/api/messages", messages);
  // app.use("/api/conversations", conversations);
  // app.use("/api/notifications", notifications);
  app.use("/api/ordermenu", menu);
  app.use("/api/categories", categories);
  app.use("/api/delivery", delivery);
  // app.use("/api/roles", roles);
  // app.use("/api/inventory", inventory);
  app.use("/api/products", products);
  // app.use("/api/delivery", delivery);
  //app.use("/api/users", users);
  app.use("/api/upload", upload);
  app.use(error);
};
