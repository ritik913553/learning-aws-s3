import jwt from 'jsonwebtoken';
const verifyUser = (req, res, next) => {
  try {
    console.log("Verifying user:" , req.cookies);
    const token = req.cookies.accessToken
    console.log("Token while verifying:",token);
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

export default verifyUser;

