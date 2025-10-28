import jwt from "jsonwebtoken";
const optionalVerifyUser = (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            req.user = null;
            return next();
        }
        req.user = decoded;
        next();
    } catch (err) {
        req.user = null;
        next();
    }
};

export default optionalVerifyUser;
