const Joi = require("joi");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const dbTable = "patients";
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/", async (req, res) => {
  db.query(
    `SELECT R.roleId,R.roleName,R.created,R.status, (SELECT COUNT(*) FROM ${dbTable} C) as rolesCount
FROM
${dbTable} R ORDER BY R.roleId DESC`,
    function (err, results) {
      //console.log(err);
      res.send(results);
    }
  );
});

// Show users
router.get("/pagination/", async (req, res) => {
  console.log(req.query);
  let { start, end } = req.query;
  db.query(
    `SELECT R.roleId,R.roleName,R.created,R.status, (SELECT COUNT(*) FROM ${dbTable} C) as rolesCount
FROM
${dbTable} R ORDER BY R.roleId DESC LIMIT ${start},${end}`,
    function (err, results) {
      console.log(err);
      res.send(results);
    }
  );
});

// Show roles by id
router.get("/:id", async (req, res) => {
  db.query(
    "SELECT * FROM `roles` WHERE `roleId` = ? ",
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res.status(400).send("The Role withe given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// Create roles
router.post("/", async (req, res) => {
  const { error } = validateRole(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "SELECT * FROM `roles` where roleName = ?",
    [req.body.roleName],
    function (err, results) {
      if (results.length > 0) {
        return res.status(400).send("Duplicate Role Found.");
      } else {
        db.query(
          "INSERT INTO `roles` (roleName,roleDescription) VALUES(?,?)",
          [req.body.roleName, req.body.roleDescription],
          function (err, results) {
            if (err) {
              res.status(500).send("Role could not be Created");
            } else {
              res.send("Role Created Successfully");
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
    "SELECT * FROM `roles` where roleId = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `roles` SET `roleName` =?, `roleDescription` =? WHERE `roleId` = ?",
          [req.body.roleName, req.body.roleDescription, req.params.id],
          function (err, results) {
            if (err) {
              console.log(err);
              res.status(500).send("Record could not be Updated");
            } else {
              res.send("Role Updated Successfully");
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

// Update roles by id
// router.put("/:id/:status", async (req, res) => {
//   db.query(
//     "SELECT * FROM `roles` where roleId = ?",
//     [req.params.id],
//     function (err, results) {
//       if (results.length > 0) {
//         db.query(
//           "UPDATE `roles` SET `status` =? WHERE `roleId` = ?",
//           [req.params.status, req.params.id],
//           function (err, results) {
//             if (err) {
//               console.log(err);
//               res.status(500).send("Record could not be Updated");
//             } else {
//               res.send("Role Updated Successfully");
//             }
//           }
//         );
//       } else {
//         return res
//           .status(400)
//           .send("The Role withe given ID could not be  Found.");
//       }
//     }
//   );
// });

// Delete roles by id
router.delete("/:id", async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} where id = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `DELETE FROM ${dbTable}  where id = ? `,
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

function validatePatient(role) {
  const schema = {
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(2).max(50).required(),
    phoneNo: Joi.string().min(2).max(50).required(),
    hospitalId: Joi.string().min(2).max(50).required(),
  };
  return Joi.validate(role, schema);
}

module.exports = router;
