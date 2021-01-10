const express = require("express");
const router = express.Router();

// Models
const User = require("../models/User");

// Register a user
// Params: username, password
// Return: None
router.post("/register", (req, res) => {
    if (!req.body.username || !req.body.password) {
      return res
        .status(400)
        .send("Error creating user, please include username and password");
    }
    let newUser = new User({
      username: req.body.username,
      password: req.body.password,
    });
    newUser
      .save()
      .then(() => {
        console.log("Created New User: ", newUser);
        return res.status(201).send(`Created user: ${newUser.username}!`);
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).send("Error creating user");
      });
  });
  
  // Login a user
  // Params: username, password
  // Return: access token
  router.post("/login", (req, res) => {
    User.findOne({ username: req.body.username })
      .then((user) => {
        user.comparePassword(req.body.password, async function (err, isMatch) {
          if (err) throw err;
          console.log("27 Valid:", isMatch);
          if (!isMatch)
            return res.status(403).send("Error logging in, incorrect password");
          const token = await user.generateAccessToken(
            req.body.username
          );
          return res.json({
            token: token,
          });
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(404).send("Error logging in, user not found");
      });
  });

  module.exports = router