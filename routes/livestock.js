const Joi = require("joi");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const dbTable = "livestock";
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/", [auth, admin], async (req, res) => {
  db.query(
    `SELECT R.livestockType,R.livestockBreed,R.livestockDob,R.livestockSex,
    R.livestockSensorId,R.livestockTagId,R.farmAddress1,R.farmAddress2,
    R.created,R.status, (SELECT COUNT(*) FROM ${dbTable} C) as livestockCount
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
    `SELECT R.livestockType,R.livestockBreed,R.livestockDob,R.livestockSex,
    R.livestockSensorId,R.livestockTagId,R.farmAddress1,R.farmAddress2,
    R.created,R.status, (SELECT COUNT(*) FROM ${dbTable} C) as rolesCount
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
    "SELECT * FROM `livestock` WHERE `id` = ? ",
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
    "SELECT * FROM `livestock` where livestockSensorId = ? AND livestockTagId = ?",
    [req.body.livestockSensorId, req.body.livestockTagId],
    function (err, results) {
      if (results.length > 0) {
        return res.status(400).send("Duplicate Record Found.");
      } else {
        db.query(
          "INSERT INTO `livestock` (livestockType,livestockBreed,livestockDob,livestockSex,livestockSensorId,livestockTagId,farmAddress1,farmAddress2) VALUES(?,?,?,?,?,?,?,?)",
          [
            req.body.livestockType,
            req.body.livestockBreed,
            req.body.livestockDob,
            req.body.livestockSex,
            req.body.livestockSensorId,
            req.body.livestockTagId,
            req.body.farmAddress1,
            req.body.farmAddress2,
          ],
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
    "SELECT * FROM `livestock` where id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `livestock` SET `livestockType` =?, `livestockBreed` =?,`livestockDob` =?,`livestockSex` =?,`livestockSensorId` =?,`livestockTagId` =?,`farmAddress1` =?,`farmAddress2` =? WHERE `id` = ?",
          [
            req.body.livestockType,
            req.body.livestockBreed,
            req.body.livestockDob,
            req.body.livestockSex,
            req.body.livestockSensorId,
            req.body.livestockTagId,
            req.body.farmAddress1,
            req.body.farmAddress2,
            req.params.id,
          ],
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
    "SELECT * FROM `livestock` where id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `livestock` SET `status` =? WHERE `id` = ?",
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
    "SELECT * FROM `livestock` where id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "DELETE FROM `livestock`  WHERE `id` = ? ",
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
    livestockType: Joi.string().min(2).max(50).required(),
    livestockBreed: Joi.string().min(2).max(50).required(),
    livestockDob: Joi.string().min(2).max(50).required(),
    livestockSex: Joi.string().min(2).max(50).required(),
    livestockSensorId: Joi.number().min(2).required(),
    livestockTagId: Joi.number().min(2).required(),
    farmAddress1: Joi.string().min(2).max(50).required(),
    farmAddress2: Joi.string().min(2).max(50).required(),
  };
  return Joi.validate(role, schema);
}

module.exports = router;
