const jwt = require('jsonwebtoken');
const JWT_SECRET = "GamingEc$mmerce";

const fetchuser = (req, res, next) => {
    const token = req.body['authtoken'];
    if (!token) {
      return res.status(401).json({ error: "Please authenticate using a valid token" });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Decoded token:', decoded); // Log the decoded token
      req.user = decoded.user;
      next();
    } catch (error) {
      console.error('Token verification error:', error); // Log the error for debugging
      return res.status(401).json({ error: "Please authenticate using a valid token" });
    }
  }
  

module.exports = fetchuser;