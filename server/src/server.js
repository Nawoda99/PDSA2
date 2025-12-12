const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 3001;

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully");

    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("All tables synced");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to database:", err);
  });
