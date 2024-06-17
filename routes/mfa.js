const Joi = require("joi");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const moment = require("moment");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const dbTable = "mfa";
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/user/:id", [auth, admin], async (req, res) => {
  console.log(req.params);
  db.query(
    `SELECT  * FROM ${dbTable} WHERE userId = ? `,
    [req.params.id],
    function (err, results) {
      if (results.length == 0) {
        res.status(400).send("The User withe given ID could not be  Found.");
      } else {
        res.send(results);
      }
    }
  );
});

// // Show roles by id
// router.get("/:id", async (req, res) => {
//   db.query(
//     "SELECT * FROM `roles` WHERE `roleId` = ? ",
//     [req.params.id],
//     function (err, results) {
//       if (results.length == 0) {
//         res.status(400).send("The Role withe given ID could not be  Found.");
//       } else {
//         res.send(results);
//       }
//     }
//   );
// });

// Create roles
router.post("/", async (req, res) => {
  const { error } = validateMfa(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `SELECT * FROM ${dbTable} where userId = ?`,
    [req.body.roleName],
    function (err, results) {
      if (results.length > 0) {
        return res.status(400).send("Duplicate MFA Found.");
      } else {
        db.query(
          "INSERT INTO `mfa` (userId,question,answer) VALUES(?,?,?)",
          [req.body.userId, req.body.question, req.body.answer],
          function (err, results) {
            if (err) {
              res.status(500).send("could not be Created");
            } else {
              res.send("Created Successfully");
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
    "SELECT * FROM `mfa` where id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "UPDATE `mfa` SET `question` =?, `answer` =? WHERE `id` = ?",
          [req.body.question, req.body.answer, req.params.id],
          function (err, results) {
            if (err) {
              console.log(err);
              res.status(500).send("Record could not be Updated");
            } else {
              res.send("Updated Successfully");
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

// // Update roles by id
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
    "SELECT * FROM `mfa` where id = ?",
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          "DELETE FROM `mfa`  WHERE `id` = ? ",
          [req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("Record could not be Deleted");
            } else {
              res.send("Deleted Successfully");
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The MFA withe given ID could not be  Found.");
      }
    }
  );
});

function validateMfa(role) {
  const schema = {
    userId: Joi.number().required(),
    question: Joi.string().min(2).required(),
    answer: Joi.string().min(2).required(),
  };
  return Joi.validate(role, schema);
}

module.exports = router;
