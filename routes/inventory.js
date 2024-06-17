const Joi = require("joi");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const dbTable = "inventory";
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/", [auth, admin], async (req, res) => {
  db.query(
    `SELECT R.id,R.category,R.name,R.quantity,
    R.created,R.status, (SELECT COUNT(*) FROM ${dbTable} C) as tableCount
FROM
${dbTable} R ORDER BY R.id DESC`,
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
    `SELECT R.id,R.category,R.name,R.quantity,
    R.created,R.status, (SELECT COUNT(*) FROM ${dbTable} C) as tableCount
FROM
${dbTable} R ORDER BY R.id DESC LIMIT ${start},${end}`,
    function (err, results) {
      console.log(err);
      res.send(results);
    }
  );
});

// Show roles by id
router.get("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `inventory` WHERE `id` = ? ",
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res.status(400).send("The Record withe given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// Create roles
router.post("/", async (req, res) => {
  const { error } = validateRecord(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "SELECT * FROM `inventory` where category = ? AND name = ?",
    [req.body.category, req.body.name],
    function (err, results) {
      if (results.length > 0) {
        return res.status(400).send("Duplicate Record Found.");
      } else {
        db.query(
          "INSERT INTO `inventory` (category,name,quantity) VALUES(?,?,?)",
          [req.body.category, req.body.name, req.body.quantity],
          function (err, results) {
            console.log(err);
            if (err) {
              res.status(500).send("Record could not be Created");
            } else {
              res.send("Record Created Successfully");
            }
          }
        );
      }
    }
  );
});

// Update roles by id
router.put("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `inventory` where id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `inventory` SET `category` =?, `name` =?,`quantity` =? WHERE `id` = ?",
          [req.body.category, req.body.name, req.body.quantity, req.params.id],
          function (err, results) {
            if (err) {
              console.log(err);
              res.status(500).send("Record could not be Updated");
            } else {
              res.send("Record Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The Record withe given ID could not be  Found.");
      }
    }
  );
});

// Update roles by id
router.put("/:id/:status", async (req, res) => {
  db.query(
    "SELECT * FROM `inventory` where id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `inventory` SET `status` =? WHERE `id` = ?",
          [req.params.status, req.params.id],
          function (err, results) {
            if (err) {
              console.log(err);
              res.status(500).send("Record could not be Updated");
            } else {
              res.send("Record Updated Successfully");
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

// Delete roles by id
router.delete("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `inventory` where id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "DELETE FROM `inventory`  WHERE `id` = ? ",
          [req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("Record could not be Deleted");
            } else {
              res.send("Record Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The Record withe given ID could not be  Found.");
      }
    }
  );
});

function validateRecord(role) {
  const schema = {
    category: Joi.string().min(2).max(50).required(),
    name: Joi.string().min(2).max(50).required(),
    quantity: Joi.number().min(1).required(),
  };
  return Joi.validate(role, schema);
}

module.exports = router;
