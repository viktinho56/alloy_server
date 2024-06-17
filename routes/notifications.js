const Joi = require("joi");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const moment = require("moment");
const dbTable = "notifications";
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const db = require("../startup/db")();

router.get("/", [auth, admin], async (req, res) => {
  db.query(
    `SELECT N.staffId,N.message,N.created,N.status,S.id,S.firstName,S.lastName,S.email,S.roleId,S.status,S.avatarUrl,S.authStatus, (SELECT COUNT(*) FROM ${dbTable} C) as notificationsCount
FROM
${dbTable} N, staff S WHERE N.staffId = S.id ORDER BY N.id DESC`,
    function (err, results) {
      //console.log(err);
      res.send(results);
    }
  );
});

// Show users
router.get("/pagination/", [auth, admin], async (req, res) => {
  console.log(req.query);
  let { start, end } = req.query;
  db.query(
    `SELECT N.staffId,N.message,N.created,N.status,S.id,S.firstName,S.lastName,S.email,S.roleId,S.status,S.avatarUrl,S.authStatus, (SELECT COUNT(*) FROM ${dbTable} C) as notificationsCount
FROM
${dbTable} N, staff S WHERE N.staffId = S.id ORDER BY N.id DESC LIMIT ${start},${end}`,
    function (err, results) {
      console.log(err);
      res.send(results);
    }
  );
});

// Show roles by id
router.get("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `notifications` WHERE `id` = ? ",
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res
          .status(400)
          .send("The Notification withe given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// Show roles by id
router.get("/staff/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `notifications` WHERE `staffId` = ? ",
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res
          .status(400)
          .send("The Notification withe given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// Create roles
router.post("/", async (req, res) => {
  const { error } = validateNotification(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "INSERT INTO `notifications` (staffId,message) VALUES(?,?)",
    [req.body.staffId, req.body.message],
    function (err, results) {
      if (err) {
        res.status(500).send("could not be Created");
      } else {
        res.send("Created Successfully");
      }
    }
  );
});

// Update roles by id
router.put("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `notifications` where id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `notifications` SET `status` =? WHERE `id` = ? ",
          [req.body.status, req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("could not be Updated");
            } else {
              res.send("Updated Successfully");
            }
          }
        );
      } else {
        return res.status(400).send("The given ID could not be  Found.");
      }
    }
  );
});

// Delete roles by id
router.delete("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `notifications` where id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "DELETE FROM `notifications`  WHERE `id` = ? ",
          [req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("could not be Deleted");
            } else {
              res.send("Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The Role withe given ID could not be  Found.");
      }
    }
  );
});

function validateNotification(role) {
  const schema = {
    staffId: Joi.string().min(2).max(50).required(),
    message: Joi.string().min(2).required(),
  };
  return Joi.validate(role, schema);
}

module.exports = router;
