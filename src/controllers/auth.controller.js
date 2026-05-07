const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * @name registerUserController
 * @description register a new user, expects username, email and the password in the req.body
 * @access Public 
 */

let user = null;

async function registerUserController(req, res) {
    const { username, email, password } = req.body


    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username,email,password"
        })
    }
    const isUserAlreadyExixts = await userModel.findOne({
        $or: [{ username }, { email }]
    })

    if (isUserAlreadyExixts) {
        return res.status(400).json({
            message: "Account already exists with this username or email"
        })
    }


    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword
    })

    /**
     * The jwt.sign() method is used to generate a secure
     * JSON Web Token (JWT). This token contains a payload 
     * (data) that is cryptographically signed using a secret 
     * key or a private key
     */
    const token = jwt.sign(                          //const token = jwt.sign(payload, secretOrPrivateKey, [options, callback]);
        { id: user._id, username: user.name },
        process.env.jwtSecret,
        { expiresIn: "1d" }
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

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({
            message: "Invalid Username or Password"
        })
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password)

    if (!isPasswordMatched) {
        return res.status(400).json({
            message: "Invalid Username or Password"
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.name },
        process.env.jwtSecret,
        { expiresIn: "1d" }
    )
    res.cookie("token", token)

    res.status(200).json({
        message: "User logged in Successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}


module.exports = { registerUserController, loginUserController };