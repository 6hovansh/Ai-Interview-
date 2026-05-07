const jwt = require("jsonwebtoken")

// middleware to protect routes, check if token is valid and add user details to req.user
function authUser(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "token not found, authorization denied"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.jwtSecret)
        req.user = decoded   //here the user is new proprty/variable created here and doesnt exist before.
        next()
    } catch (err) {
        return res.status(401).json({
            message: "Invalid token, authorization denied"
        })
    }
}

module.exports = authUser;