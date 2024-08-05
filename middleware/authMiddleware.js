const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(400).json({ message: 'Not authenticated' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(400).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

module.exports = authMiddleware;
