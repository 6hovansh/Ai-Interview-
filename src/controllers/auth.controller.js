const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
                message: "Account already exists with this username or email"
            })
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword
    })

    const token = jwt.sign({ id: user._id,username:user.name },
         process.env.jwtSecret,
          {expiresIn:"1d"}
        )
        res.cookie("token", token)

        res.status(201).json({
            message: "User Registered Successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
}

/**
 * @name loginUserController
 * @description login a user, expects email and the password in the req.body
 * @access Public           
 */
async function loginUserController(req, res) {
    const { email, password } = req.body
}


module.exports = { registerUserController };