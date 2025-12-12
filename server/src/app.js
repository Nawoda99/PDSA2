const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.route");
const { errorHandler } = require("./middlewares/errorHandler");
const eightQueenRoutes = require("./routes/eightQueens.route");
const trafficSimulationRoutes = require("./routes/trafficSimulation.route");
const path = require("path");
const travelingSalesmanRoutes = require("./routes/travelingSalesman.route");
const hanoiTowerRoutes = require("./routes/hanoiTower.route");

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
app.use(express.static(path.join(__dirname, "../../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist", "index.html"));
});

app.use("/api/users", userRoutes);
app.use("/api/eightQueens", eightQueenRoutes);
app.use("/api/traffic", trafficSimulationRoutes);
app.use("/api/tsp", travelingSalesmanRoutes);
app.use("/api/hanoi", hanoiTowerRoutes);

app.use(errorHandler);

module.exports = app;
