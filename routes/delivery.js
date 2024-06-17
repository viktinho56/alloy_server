const Joi = require("joi");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const moment = require("moment");
const dbTable = "delivery";
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const db = require("../startup/db")();

router.get("/", [auth, admin], async (req, res) => {
  db.query(
    `SELECT N.id,N.productId,N.quantity,N.trackingNo,N.toLocation,N.created,N.status, (SELECT COUNT(*) FROM ${dbTable} C) as deliveryCount
FROM
${dbTable} N ORDER BY N.id DESC`,
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
    `SELECT N.id,N.productId,N.quantity,N.trackingNo,N.toLocation,N.created,N.status, (SELECT COUNT(*) FROM ${dbTable} C) as deliveryCount FROM
${dbTable} N ORDER BY N.id DESC LIMIT ${start},${end}`,
    function (err, results) {
      console.log(err);
      res.send(results);
    }
  );
});

// Show roles by id
// router.get("/:id", async (req, res) => {
//   db.query(
//     "SELECT * FROM `notifications` WHERE `id` = ? ",
//     [req.params.id],
//     function (err, results) {
//       if (results.length == 0) {
//         res
//           .status(400)
//           .send("The Notification withe given ID could not be  Found.");
//       } else {
//         res.send(results);
//       }
//     }
//   );
// });

// Show roles by id
// router.get("/staff/:id", async (req, res) => {
//   db.query(
//     "SELECT * FROM `notifications` WHERE `staffId` = ? ",
//     [req.params.id],
//     function (err, results) {
//       if (results.length == 0) {
//         res
//           .status(400)
//           .send("The Notification withe given ID could not be  Found.");
//       } else {
//         res.send(results);
//       }
//     }
//   );
// });

//Create roles
router.post("/", async (req, res) => {
  const { error } = validateDelivery(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "INSERT INTO `delivery` (email,productId,quantity,trackingNo,toLocation) VALUES(?,?,?,?,?)",
    [
      req.body.email,
      req.body.productId,
      req.body.quantity,
      req.body.trackingNo,
      req.body.toLocation,
    ],
    function (err, results) {
      if (err) {
        console.log(err);
        res.status(500).send("could not be Created");
      } else {
        res.send("Created Successfully");
      }
    }
  );
});

// Update roles by id
// router.put("/:id", async (req, res) => {
//   db.query(
//     "SELECT * FROM `notifications` where id = ?",
//     [req.params.id],
//     function (err, results) {
//       if (results.length > 0) {
//         db.query(
//           "UPDATE `notifications` SET `status` =? WHERE `id` = ? ",
//           [req.body.status, req.params.id],
//           function (err, results) {
//             if (err) {
//               res.status(500).send("could not be Updated");
//             } else {
//               res.send("Updated Successfully");
//             }
//           }
//         );
//       } else {
//         return res.status(400).send("The given ID could not be  Found.");
//       }
//     }
//   );
// });

// Delete roles by id
// router.delete("/:id", async (req, res) => {
//   db.query(
//     "SELECT * FROM `notifications` where id = ?",
//     [req.params.id],
//     function (err, results) {
//       if (results.length > 0) {
//         db.query(
//           "DELETE FROM `notifications`  WHERE `id` = ? ",
//           [req.params.id],
//           function (err, results) {
//             if (err) {
//               res.status(500).send("could not be Deleted");
//             } else {
//               res.send("Deleted Successfully");
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

function validateDelivery(role) {
  const schema = {
    email: Joi.string().min(2).required(),
    productId: Joi.string().required(),
    quantity: Joi.number().required(),
    trackingNo: Joi.string().min(2).required(),
    toLocation: Joi.string().min(2).required(),
  };
  return Joi.validate(role, schema);
}

module.exports = router;
