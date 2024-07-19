const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
  return jwt.sign({
    userId: user._id,
    username: user.username,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name
  }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401); // No token provided

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden

    req.user = user; // Set the user in request object
    next(); // Pass the request to the next middleware
  });
}

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", ""); // Extract token from Authorization header
  if (token == "null") {
    return res.status(401).json({ error: "Not Logged in" });
  }
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Verify JWT token
    req.user = decoded; // Attach user information to request object
    next(); // Move to the next middleware
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = {
  generateAccessToken,
  authenticateToken,
  verifyToken
};
