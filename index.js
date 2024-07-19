require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwtUtils = require("./util/jwtUtil"); // Import JWT functions
const app = express();

const PORT = process.env.PORT || 8000;
const book_router = require("./router/book_router");
const user_router = require("./router/user_router");

// Middleware for parsing JSON and urlencoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/bookstore", book_router);
app.use("/user", user_router);

// Database connection
mongoose.connect(process.env.DB_HOST);

let db = mongoose.connection;

db.once("open", () => {
  console.log("Connected to MongoDB");
});
db.on("error", (err) => {
  console.error("DB Error:" + err);
});

// Homepage redirection
app.get("/", (req, res) => {
  res.redirect("/bookstore");
});

// Server start
app.listen(PORT, () =>
  console.log(`Server started on http://127.0.0.1:${PORT}`)
);
