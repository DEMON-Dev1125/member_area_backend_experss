const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/usersModel.js");
const config = require("../config");

const router = express.Router();

// Check if E-mail is Valid or not
const validateEmail = (email) => {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

const checkUserUniqueness = (field, value) => {
  return ({ error, isUnique } = User.findOne({ [field]: value })
    .exec()
    .then((user) => {
      let res = {};
      if (Boolean(user)) {
        res = {
          error: { [field]: "This " + field + " is not available" },
          isUnique: false,
        };
      } else {
        res = { error: { [field]: "" }, isUnique: true };
      }
      return res;
    })
    .catch((err) => {
      console.log(err);
      return err;
    }));
};

router.post("/validate", async (req, res) => {
  const { field, value } = req.body;
  const { error, isUnique } = await checkUserUniqueness(field, value);

  if (isUnique) {
    res.json({ success: "success" });
  } else {
    res.json({ error });
  }
});

router.post("/signup", async (req, res) => {
  const name = req.body.name || "";
  const username = req.body.username || "";
  const email = req.body.email || "";
  const password = req.body.password || "";
  const confirmPassword = req.body.confirmPassword || "";

  const reqBody = { name, username, email, password, confirmPassword };

  let errors = {};

  if (reqBody["email"] && !validateEmail(reqBody["email"])) {
    errors = { ...errors, ["email"]: "Not a valid Email" };
  }
  if (reqBody["password"] && password !== "" && password < 4) {
    errors = { ...errors, ["password"]: "Password too short" };
  }
  if (reqBody["confirmPassword"] && confirmPassword !== password) {
    errors = { ...errors, ["confirmPassword"]: "Passwords do not match" };
  }

  if (reqBody["username"]) {
    const { error, isUnique } = await checkUserUniqueness(
      "username",
      reqBody["username"]
    );
    if (!isUnique) {
      errors = { ...errors, ...error };
    }
  }
  if (reqBody["email"]) {
    const { error, isUnique } = await checkUserUniqueness(
      "email",
      reqBody["email"]
    );
    if (!isUnique) {
      errors = { ...errors, ...error };
    }
  }

  if (Object.keys(errors).length > 0) {
    res.json({ errors });
  } else {
    const newUser = new User({
      name: name,
      username: username,
      email: email,
      password: password,
    });

    // Generate the Salt
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return err;
      // Create the hashed password
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) return err;
        newUser.password = hash;
        // Save the User
        newUser.save(function (err) {
          if (err) return err;
          res.json({ success: "success" });
        });
      });
    });
  }
});

router.post("/signin", (req, res) => {
  const username = req.body.username || "";
  const email = req.body.email || "";
  const password = req.body.password || "";

  let errors = {};

  if (email === "") {
    errors = { ...errors, username: "This field is required" };
  }
  if (password === "") {
    errors = { ...errors, password: "This field is required" };
  }

  if (Object.keys(errors).length > 0) {
    res.json({ errors });
  } else {
    User.findOne({ email: email }, (err, user) => {
      if (err) throw err;
      if (Boolean(user)) {
        // Match Password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) return err;
          if (isMatch) {
            const token = jwt.sign(
              {
                id: user._id,
                username: user.username,
              },
              config.jwtSecret
            );
            res.json({ token, success: "success" });
          } else {
            res.json({ errors: { invalidCredentials: "Invalid Password" } });
          }
        });
      } else {
        res.json({ errors: { invalidCredentials: "Invalid Email" } });
      }
    });
  }
});

module.exports = router;
