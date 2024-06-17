const Joi = require("joi");
const config = require("config");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const dbTable = "patients";
const db = require("../startup/db")();
const { generateAuthToken } = require("../helpers/token");
const { sendPasswordResetEmail, sendOtpEmail } = require("./../helpers/email");

const resetUrl = config.get("client_url") + "/reset-password";

// Authorize users
router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  console.log(req.body);
  const currentDateTime = new Date();
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `SELECT * FROM ${dbTable} WHERE email =? AND status = ?`,
    [req.body.email, 1],
    async function (err, results) {
      if (results.length == 1) {
        const user = results[0];
        const validPassword = await bcrypt.compare(
          req.body.password,
          user.password
        );

        if (!validPassword) {
          // db.query(`UPDATE ${dbTable} SET errorCount = ? WHERE email = ?`, [
          //   (user.errorCount += 1),
          //   req.body.email,
          // ]);
          // db.query(
          //   `INSERT INTO notifications (staffId,message,status) VALUES(?,?,?)`,
          //   [user.id, "Login Failed", 1],
          //   function (err, results) {
          //     if (err) {
          //       console.log(err);
          //       // res.status(500).send("Admin could not be Created");
          //     } else {
          //       //res.send("Admin Created Successfully");
          //     }
          //   }
          // );
          return res
            .status(400)
            .send("Invalid email / password . Please Try again");
        }
        // if (user.roleId == 1) {
        //   user.isAdmin = true;
        // }
        const token = generateAuthToken(user);
        let fullName = user.firstName + " " + user.lastName;
        // sendOtpEmail(req.body.email, "OTP", req.body.otpCode, fullName);
        //  else {
        //   db.query(`UPDATE ${dbTable} SET errorCount = ? WHERE email = ?`, [
        //     0,
        //     req.body.email,
        //   ]);
        //   db.query(
        //     `INSERT INTO notifications (staffId,message,status) VALUES(?,?,?)`,
        //     [user.id, "Login Successful", 2],
        //     function (err, results) {
        //       if (err) {
        //         console.log(err);
        //         // res.status(500).send("Admin could not be Created");
        //       } else {
        //         //res.send("Admin Created Successfully");
        //       }
        //     }
        //   );
        // }

        res.send(token);
      } else {
        return res
          .status(400)
          .send(
            "Invalid email or password or Account not Activated. Please Try again"
          );
      }
    }
  );
});

router.post("/admin", async (req, res) => {
  db.query(
    `SELECT * FROM admin WHERE email =?`,
    [req.body.email],
    async function (err, results) {
      if (results.length == 1) {
        const user = results[0];
        const validPassword = await bcrypt.compare(
          req.body.password,
          user.password
        );

        if (!validPassword) {
          return res
            .status(400)
            .send("Invalid email or password. Please Try again");
        }

        const token = generateAuthToken(user);
        let fullName = user.firstName + " " + user.lastName;

        res.send(token);
      } else {
        return res
          .status(400)
          .send("Invalid email or password. Please Try again");
      }
    }
  );
});

router.post("/authorize", async (req, res) => {
  // const { error } = validateUser(req.body);
  const currentDateTime = new Date();
  // if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `SELECT * FROM patients WHERE email =?`,
    [req.body.email],
    async function (err, results) {
      if (results.length == 1) {
        const user = results[0];
        const validPassword = await bcrypt.compare(
          req.body.password,
          user.password
        );
        // if (user.errorCount >= 3) {
        //   return res.status(400).send("Account Temporarily locked");
        // }
        if (!validPassword) {
          // db.query(`UPDATE ${dbTable} SET errorCount = ? WHERE email = ?`, [
          //   (user.errorCount += 1),
          //   req.body.email,
          // ]);
          // db.query(
          //   `INSERT INTO notifications (staffId,message,status) VALUES(?,?,?)`,
          //   [user.id, "Login Failed", 1],
          //   function (err, results) {
          //     if (err) {
          //       console.log(err);
          //       // res.status(500).send("Admin could not be Created");
          //     } else {
          //       //res.send("Admin Created Successfully");
          //     }
          //   }
          // );
          return res
            .status(400)
            .send("Invalid email or password. Please Try again");
        }
        // if (user.roleId == 1) {
        //   user.isAdmin = true;
        // }
        const token = generateAuthToken(user);
        let fullName = user.firstName + " " + user.lastName;
        //sendOtpEmail(req.body.email, "OTP", req.body.otpCode, fullName);
        // if (user.authStatus == 1) {
        //   sendOtpEmail(req.body.email, "OTP", req.body.code, fullName);
        // }
        //  else {
        //   db.query(`UPDATE ${dbTable} SET errorCount = ? WHERE email = ?`, [
        //     0,
        //     req.body.email,
        //   ]);
        //   db.query(
        //     `INSERT INTO notifications (staffId,message,status) VALUES(?,?,?)`,
        //     [user.id, "Login Successful", 2],
        //     function (err, results) {
        //       if (err) {
        //         console.log(err);
        //         // res.status(500).send("Admin could not be Created");
        //       } else {
        //         //res.send("Admin Created Successfully");
        //       }
        //     }
        //   );
        // }

        res.send(token);
      } else {
        return res
          .status(400)
          .send("Invalid email or password. Please Try again");
      }
    }
  );
});

// Authorize users
router.post("/email", async (req, res) => {
  //const { error } = validateUser(req.body);
  const currentDateTime = new Date();
  //if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `SELECT * FROM users WHERE email =?`,
    [req.body.email],
    async function (err, results) {
      if (results.length == 1) {
        const user = results[0];
        // db.query(
        //   `INSERT INTO notifications (staffId,message,status) VALUES(?,?,?)`,
        //   [user.id, "Login Successful", 1],
        //   function (err, results) {
        //     if (err) {
        //       console.log(err);
        //       // res.status(500).send("Admin could not be Created");
        //     } else {
        //       //res.send("Admin Created Successfully");
        //     }
        //   }
        // );
        const token = generateAuthToken(user);

        res.send(token);
      } else {
        return res.status(400).send("Invalid email");
      }
    }
  );
});

router.post("/recover/email", async (req, res) => {
  //const { error } = validateUser(req.body);
  const currentDateTime = new Date();
  //if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `SELECT * FROM ${dbTable} WHERE email =?`,
    [req.body.email],
    async function (err, results) {
      if (results.length == 1) {
        const user = results[0];
        const token = generateAuthToken(user);
        res.send(token);
      } else {
        return res.status(400).send("Invalid email");
      }
    }
  );
});

router.post("/password-reset", async (req, res) => {
  let table = "staff";
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
  let table = "staff";
  db.query(
    `SELECT * FROM ${table} WHERE email =?`,
    [req.body.email],
    function (err, results) {
      if (results.length > 0) {
        const user = results[0];

        const token = generateAuthToken(user);

        db.query(
          `UPDATE ${table} SET password =?, passwordStatus = ? WHERE email = ? `,
          [cryptedPassword, 1, req.body.email],
          function (err, results) {
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

router.put("/update-auth-status", async (req, res) => {
  console.log(req.body);
  // const salt = await bcrypt.genSalt(10);
  //let cryptedPassword = await bcrypt.hash(req.body.password, salt);
  let table = "staff";
  db.query(
    `SELECT * FROM ${table} WHERE email =?`,
    [req.body.email],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `UPDATE ${table} SET authStatus =? WHERE email = ? `,
          [0, req.body.email],
          function (err, results) {
            if (err) {
              res.status(500).send("User  could not be Updated");
            } else {
              res.send("Updated Successfully");
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

// Authorize users
router.post("/verify", async (req, res) => {
  const { error } = validateUser(req.body);
  const currentDateTime = new Date();
  if (error) return res.status(400).send(error.details[0].message);
  db.query(
    `SELECT * FROM ${dbTable} WHERE email =?`,
    [req.body.email],
    async function (err, results) {
      if (results.length == 1) {
        const user = results[0];
        res.send("Verified Successfully");
      } else {
        return res.status(400).send("Invalid email or password.");
      }
    }
  );
});

// Deactivate User Account
router.put("/account/:id/:status", async (req, res) => {
  db.query(
    `SELECT * FROM ${dbTable} where id = ?`,
    [req.params.id],
    function (err, results) {
      if (results.length > 0) {
        db.query(
          `UPDATE ${dbTable} SET status =? WHERE id = ? `,
          [req.params.status, req.params.id],
          function (err, results) {
            if (err) {
              res.status(500).send("Account could not be Updated");
            } else {
              res.send("Account Updated Successfully");
            }
          }
        );
      } else {
        return res
          .status(400)
          .send("The User with the given ID could not be  Found.");
      }
    }
  );
});

// Deactivate User Account
// router.put("/setGeolocation", async (req, res) => {
//   db.query(
//     `SELECT * FROM ${dbTable} where userId = ?`,
//     [req.body.userId],
//     function (err, results) {
//       if (results.length > 0) {
//         db.query(
//           `UPDATE ${dbTable} SET latitude =?,longitude =? WHERE userId = ? `,
//           [req.body.latitude, req.body.longitude, req.body.userId],
//           function (err, results) {
//             if (err) {
//               res.status(500).send("User Account could not be Updated");
//             } else {
//               res.send("User Account Updated Successfully");
//             }
//           }
//         );
//       } else {
//         return res
//           .status(400)
//           .send("The User with the given ID could not be  Found.");
//       }
//     }
//   );
// });

function validateUser(user) {
  const schema = {
    email: Joi.string().min(2).max(255).required(),
    //code: Joi.number().min(2).required(),
    password: Joi.string().min(2).max(50).required(),
  };
  return Joi.validate(user, schema);
}

module.exports = router;
