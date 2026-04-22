const userModel = require("../models/user.model");


/**
 * @name registerUserController
 * @description register a new user, expects username, email and the password in the req.body
 * @access Public 
 */


async function registerUserController(req, res) {
    const { username, email, password } = req.body


    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username,email,password"
        })

        const isUserAlreadyExixts = await userModel.findOne({
            $or: [{ username }, { email }]
        })

        if (isUserAlreadyExixts) {
            return res.status(400).json({
                message: "Account already exists with this username or eamil"
            })
        }
    }
}

module.exports = { registerUserController };