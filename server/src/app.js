const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.route");
const { errorHandler } = require("./middlewares/errorHandler");
const eightQueenRoutes = require("./routes/eightQueens.route");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Gaming Server API is running",
    version: "1.0.0",
  });
});

app.use("/users", userRoutes);
app.use("/api/eightQueens", eightQueenRoutes);

app.use(errorHandler);

module.exports = app;
