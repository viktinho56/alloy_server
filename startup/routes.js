const express = require("express");
const auth = require("../routes/auth");
const users = require("../routes/users");
const categories = require("../routes/categories");
const menu = require("../routes/menu");
const delivery = require("../routes/delivery");
const products = require("../routes/products");
const email = require("../routes/email");
const cart = require("../routes/cart");
const upload = require("../routes/upload");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/auth", auth);
  app.use("/api/users", users);
  app.use("/api/email", email);
  app.use("/api/ordermenu", menu);
  app.use("/api/categories", categories);
  app.use("/api/delivery", delivery);
  app.use("/api/products", products);
  app.use("/api/upload", upload);
  app.use("/api/cart", cart);
  app.use(error);
};
