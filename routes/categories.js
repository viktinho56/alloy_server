const Joi = require("joi");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const moment = require("moment");
const dbTable = "categories";
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

router.get("/category-menu/:id", async (req, res) => {
  db.query(
    `SELECT * FROM categoryMenu N WHERE N.categoryId = ? ORDER BY id DESC`,
    [req.params.id],
    function (err, results) {
      //console.log(err);
      res.send(results);
    }
  );
});

router.post("/category-menu", [auth], async (req, res) => {
  db.query(
    `SELECT * FROM categoryMenu where categoryId = ? and menuId = ?`,
    [req.body.categoryId, req.body.menuId],
    function (err, results) {
      if (results.length > 0) {
        // let conv = results[0].id;
        // console.log(conv);
        // res.send(conv);
        return res.status(400).send("This Conversation exist already");
      } else {
        db.query(
          `INSERT INTO categoryMenu (categoryId,menuId) VALUES(?,?)`,
          [req.body.categoryId, req.body.menuId],
          function (err, results) {
            if (err) {
              console.log(err);
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

router.get("/pagination/", async (req, res) => {
  console.log(req.query);
  let { start, end } = req.query;
  db.query(
    `SELECT R.id,R.categoryName,R.categoryDesc,R.status, (SELECT COUNT(*) FROM ${dbTable} C) as categoryCount
FROM
${dbTable} R ORDER BY R.id DESC LIMIT ${start},${end}`,
    function (err, results) {
      console.log(err);
      res.send(results);
    }
  );
});

router.post("/", async (req, res) => {
  const { error } = validateCategory(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `INSERT INTO ${dbTable} (categoryName,categoryDesc,status) VALUES(?,?,?)`,
    [req.body.categoryName, req.body.categoryDesc, req.body.status],
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
  db.query(
    `SELECT * FROM ${dbTable} where id = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `UPDATE ${dbTable} SET categoryName =?, categoryDesc =?,status =?  WHERE id = ? `,
          [
            req.body.categoryName,
            req.body.categoryDesc,
            req.body.status,
            req.params.id,
          ],
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
    categoryName: Joi.string().min(2).required(),
    categoryDesc: Joi.string().min(2).required(),
    status: Joi.bool().required(),
  };
  return Joi.validate(role, schema);
}

module.exports = router;
