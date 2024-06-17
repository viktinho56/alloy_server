const Joi = require("joi");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const moment = require("moment");
const dbTable = "products";
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const db = require("../startup/db")();

router.get("/", [auth], async (req, res) => {
  db.query(
    `SELECT R.id,R.productName,R.productDescription,R.avatarUrl,R.status, (SELECT COUNT(*) FROM ${dbTable} C) as tableCount
FROM
${dbTable} R ORDER BY R.id DESC`,
    function (err, results) {
      //console.log(err);
      res.send(results);
    }
  );
});

// Show users
router.get("/pagination/", [auth], async (req, res) => {
  console.log(req.query);
  let { start, end } = req.query;
  db.query(
    `SELECT R.id,R.productName,R.productDescription,R.avatarUrl,R.status, (SELECT COUNT(*) FROM ${dbTable} C) as tableCount
FROM
${dbTable} R ORDER BY R.id DESC LIMIT ${start},${end}`,
    function (err, results) {
      console.log(err);
      res.send(results);
    }
  );
});

router.post("/", async (req, res) => {
  const { error } = validateProduct(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    "INSERT INTO `products` (productName,productDescription,avatarUrl,status) VALUES(?,?,?,?)",
    [
      req.body.productName,req.body.productDescription,req.body.avatarUrl,req.body.status,
    ],
    function (err, results) {
      if (err) {
        res.status(500).send("could not be Created");
      } else {
        res.send("Created Successfully");
      }
    }
  );
});

//Update roles by id
router.put("/:id", async (req, res) => {
  console.log(req.body);
  //let status =  req.body.status == true?1:0;
  db.query(
    `SELECT * FROM ${dbTable} where id = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `UPDATE ${dbTable} SET productName =?,productDescription =?, avatarUrl =?,status=?  WHERE id = ? `,
          [
            req.body.productName,
            req.body.productDescription,
            req.body.avatarUrl,
            req.body.status,
            req.params.id,
          ],
          function (err, results) {
            if (err) {
              console.log(err);
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

function validateProduct(role) {
  const schema = {
    productName: Joi.string().min(2).required(),
    productDescription: Joi.string().min(2).required(),
    //menuId: Joi.number().required(),
    status: Joi.number().required(),
    avatarUrl: Joi.string().min(2).required(),
  };
  return Joi.validate(role, schema);
}

module.exports = router;
