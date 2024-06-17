const Joi = require("joi");
const config = require("config");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const db = require("../startup/db")();
const dbTable = "patients";
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const appUrl = config.get("client_url") + "/auth/reset-password";
const activateUrl = config.get("client_url") + "/auth/activate";
const resetUrl = config.get("client_url") + "/reset-password";
const { generateAuthToken } = require("../helpers/token");

const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../helpers/email");

// Create users
router.put("/", async (req, res) => {
  console.log(req.body);
  const { error } = validateAdmin(req.body);
  const salt = await bcrypt.genSalt(10);
  let cryptedPassword = await bcrypt.hash(req.body.password, salt);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `UPDATE  ${dbTable} SET firstName =?,lastName= ?,email= ?,phoneNo=?,password= ? WHERE hospitalId = ?`,
    [
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      req.body.phoneNo,
      cryptedPassword,
      req.body.hospitalId,
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

// Create users
router.post("/verify", async (req, res) => {
  const { error } = validateAdmin(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `SELECT * FROM ${dbTable} where hospitalId = ?`,
    [req.body.hospitalId],
    function (err, results) {
      if (results.length == 0) {
        return res
          .status(400)
          .send(
            "The information you entered does not match a current admission., PLEASE TRY AGAIN."
          );
      } else {
        res.send("Verified Successfully");
      }
    }
  );
});
// // Update user by id

router.put("/profile/:id", async (req, res) => {
  console.log(req.body);
  db.query(
    `SELECT * FROM ${dbTable} where email = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        const user = results[0];
        let authStat = 0;

        db.query(
          `UPDATE ${dbTable} SET  firstName =? , lastName =?  WHERE email = ? `,
          [req.body.firstName, req.body.lastName, req.params.id],
          function (err, results) {
            console.log(results);
            if (err) {
              console.log(err);
              res.status(500).send("could not be Updated");
            } else {
              user.firstName = req.body.firstName;
              user.lastName = req.body.lastName;
              const token = generateAuthToken(user);
              res.send(token);
              // res.send("User Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(404)
          .send("The User with the given ID could not be  Found.");
      }
    }
  );
});

// Delete user by id
router.delete("/:id", [auth, admin], async (req, res) => {
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
          .status(404)
          .send("The User withe given ID could not be  Found.");
      }
    }
  );
});

router.post("/password-reset", async (req, res) => {
  let table = "users";
  db.query(
    `SELECT * FROM ${table} WHERE email =?`,
    [req.body.email],
    async function (err, results) {
      let fullName = "";
      if (results.length == 1) {
        const user = results[0];
        fullName = user.firstName + " " + user.lastName;
        var decodedStringBtoA = req.body.email;
        // Encode the String
        var encodedStringBtoA =
          Buffer.from(decodedStringBtoA).toString("base64");
        sendPasswordResetEmail(
          req.body.email,
          "ACCOUNT PASSWORD RESET",
          "Please note that your request to reset your Account Password was successful",
          fullName,
          resetUrl + "/" + encodedStringBtoA
        );
        res.send(
          "Account Reset Email Sent Successfully, Please Check your Email"
        );
      } else {
        return res.status(400).send("Invalid email");
      }
    }
  );
});

router.put("/update-password", async (req, res) => {
  console.log(req.body);
  const salt = await bcrypt.genSalt(10);
  let cryptedPassword = await bcrypt.hash(req.body.password, salt);
  let table = "users";
  db.query(
    `SELECT * FROM ${table} WHERE email =?`,
    [req.body.email],
    function (err, results) {
      if (results.length > 0) {
        const user = results[0];

        const token = generateAuthToken(user);

        db.query(
          `UPDATE ${table} SET password =? WHERE email = ? `,
          [cryptedPassword, req.body.email],
          function (err, results) {
            console.log(err);
            if (err) {
              res.status(500).send("User password could not be Updated");
            } else {
              res.send(token);
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The User withe given Email could not be  Found.");
      }
    }
  );
});

function validateAdmin(admin) {
  const schema = {
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(2).max(50).required(),
    phoneNo: Joi.string().min(2).max(50).required(),
    hospitalId: Joi.string().min(2).max(50).required(),
  };
  return Joi.validate(admin, schema);
}

module.exports = router;
