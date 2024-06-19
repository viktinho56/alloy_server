const Joi = require("joi");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const moment = require("moment");
const dbTable = "foodcart";
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const db = require("../startup/db")();

router.get("/", async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} N ORDER BY id DESC`,
    function (err, results) {
      //console.log(err);
      res.send(results);
    }
  );
});

router.get("/:id/:status", async (req, res) => {
  db.query(
    `SELECT N.menuId,N.productId,N.quantity, R.productName,R.productDescription,R.avatarUrl FROM foodcart  N, products R WHERE N.patientId = ? AND R.id = N.productId AND N.status = ?  ORDER BY N.id DESC`,
    [req.params.id,req.params.status],
    function (err, results) {
      //console.log(err);
      res.send(results);
    }
  );
});


router.put("/place/:id", async (req, res) => {
console.log("called");
  db.query(
    `UPDATE ${dbTable} SET status = ? WHERE status = ? AND patientId = ?`,[1,0,req.params.id],
    function (err, results) {
      if (err) {
        console.log(err);
        res.status(500).send("could not be Created");
      } else {
        res.send("Updated Successfully");
      }
    }
  );
});

// router.get("/pagination/", async (req, res) => {
//   console.log(req.query);
//   let { start, end } = req.query;
//   db.query(
//     `SELECT R.id,R.menuName,R.start,R.stop,R.status, (SELECT COUNT(*) FROM ${dbTable} C) as categoryCount
// FROM
// ${dbTable} R ORDER BY R.id DESC LIMIT ${start},${end}`,
//     function (err, results) {
//       console.log(err);
//       res.send(results);
//     }
//   );
// });

router.post("/", async (req, res) => {
  const { error } = validateCategory(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `INSERT INTO ${dbTable} (productId,menuId,quantity,patientId) VALUES(?,?,?,?)`,
    [req.body.productId, req.body.menuId, req.body.quantity, req.body.patientId],
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

// router.get("/menu-item/:id", async (req, res) => {
//   db.query(
//     `SELECT N.menuId,N.productId, R.productName,R.productDescription,R.avatarUrl FROM foodmenu  N, products R WHERE N.menuId = ? AND R.id = N.productId  ORDER BY N.id DESC`,
//     [req.params.id],
//     function (err, results) {
//       console.log(err);
//       res.send(results);
//     }
//   );
// });



//Delete roles by id
router.delete("/:id", async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} where id = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `DELETE FROM ${dbTable}  WHERE id = ? `,
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

function validateCategory(role) {
  const schema = {
    productId: Joi.number().required(),
    menuId: Joi.number().required(),
    quantity: Joi.number().required(),
    patientId: Joi.number().required(),
  };
  return Joi.validate(role, schema);
}

module.exports = router;
