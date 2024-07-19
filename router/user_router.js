const express = require("express");
const router = express.Router();
const path = require("path");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwtUtils = require("../util/jwtUtil"); // Import JWT functions
const {
  validateUserSignup,
  validateUserLogin,
} = require("../middleware/validator");

// User signup
router
  .route("/sign-up")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "../views", "sign-up.html"));
  })
  .post(validateUserSignup, async (req, res) => {
    const { first_name, last_name, username, email, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        first_name,
        last_name,
        username,
        email,
        password: hashedPassword,
      });

      await newUser.save();
      res.status(201).json({ message: "Successfully Added" });
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate key error
        res.status(400).json({ error: "Username or email already exists" });
      } else {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  });

// User login with JWT token generation
router
  .route("/login")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "../views", "login.html"));
  })
  .post(validateUserLogin, (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email })
      .then((user) => {
        if (!user) {
          console.log(`User with email ${email} not found`);
          return res
            .status(400)
            .json({ error: `User with email ${email} not found` });
        }

        return bcrypt.compare(password, user.password).then((isMatched) => {
          if (!isMatched) {
            return res
              .status(400)
              .json({ error: `Incorrect password for user ${email}` });
          }

          // Generate JWT token with additional user information
          const token = jwtUtils.generateAccessToken({
            _id: user._id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
          });

          res.json({
            token,
            message: `Hello ${user.first_name}, with username ${user.username} (${email}) logged in successfully`,
          });
        });
      })
      .catch((error) => {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  });

// Example route requiring authentication
router.get("/me", jwtUtils.verifyToken, (req, res) => {
  const userId = req.user.userId; // Access user ID from decoded token
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    })
    .catch((error) => {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

module.exports = router;
