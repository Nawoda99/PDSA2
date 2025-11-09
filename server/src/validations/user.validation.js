const validateUsername = (req, res, next) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username is required",
    });
  }

  if (username.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Username must be at least 3 characters",
    });
  }

  if (username.length > 20) {
    return res.status(400).json({
      success: false,
      message: "Username must not exceed 20 characters",
    });
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({
      success: false,
      message: "Username can only contain letters, numbers, and underscores",
    });
  }

  next();
};

module.exports = { validateUsername };
