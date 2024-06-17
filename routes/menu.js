const Joi = require("joi");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const moment = require("moment");
const dbTable = "ordermenu";
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


router.get("/pagination/", async (req, res) => {
  console.log(req.query);
  let { start, end } = req.query;
  db.query(
    `SELECT R.id,R.menuName,R.start,R.stop,R.status, (SELECT COUNT(*) FROM ${dbTable} C) as categoryCount
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
    `INSERT INTO ${dbTable} (menuName,start,stop,status) VALUES(?,?,?,?)`,
    [req.body.menuName, req.body.start, req.body.stop, req.body.status],
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

router.get("/menu-item/:id", async (req, res) => {
  db.query(
    `SELECT * FROM foodmenu  N WHERE menuId = ?  ORDER BY id DESC`,[req.params.id],
    function (err, results) {
      //console.log(err);
      res.send(results);
    }
  );
});


router.post("/menu-item", async (req, res) => {
//   const { error } = validateCategory(req.body);
//   if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `INSERT INTO foodmenu (productId,menuId) VALUES(?,?)`,
    [req.body.productId, req.body.menuId],
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

router.delete("/menu-item/:pid/:mid", async (req, res) => {
    console.log(req.params.id);
  db.query(
    `SELECT * FROM foodmenu where productId=? AND menuId = ?`,
    [req.params.pid, req.params.mid],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `DELETE FROM foodmenu  where productId=? AND menuId = ? `,
          [req.params.pid, req.params.mid],
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



//Update roles by id
router.put("/:id", async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} where id = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `UPDATE ${dbTable} SET menuName =?, start =?,stop=?,status =?  WHERE id = ? `,
          [
            req.body.menuName,
            req.body.start,
            req.body.stop,
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
    menuName: Joi.string().min(2).required(),
    start: Joi.string().min(2).required(),
    stop: Joi.string().min(2).required(),
    status: Joi.number().required(),
  };
  return Joi.validate(role, schema);
}

module.exports = router;
