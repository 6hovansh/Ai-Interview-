const jwt = require("jsonwebtoken")
const blacklistTokenModel = require("../models/blacklist.model")

// middleware to protect routes, check if token is valid and add user details to req.user
async function authUser(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "token not found, authorization denied"
        })
    }

    const isBlacklistedToken = await blacklistTokenModel.findOne({ token })

    if (isBlacklistedToken) {
        return res.status(401).json({
            message: "Token is invalid, authorization denied"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.jwtSecret)
        req.user = decoded   //here the user is new property/variable created here and doesnt exist before.
        next()
    } catch (err) {
        return res.status(401).json({
            message: "Invalid token, authorization denied"
        })
    }
}

module.exports = { authUser };