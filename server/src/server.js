const sequelize = require("./config/DB");
const app = require("./app");
const port = process.env.PORT || 3002;

sequelize
  .authenticate()
  .then(() => {
    console.log("MySQL connected successfully");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MySQL connection error:", err);
    process.exit(1);
  });
