const { Router } = require("express")
const authController = require("../controllers/auth.controller")

const authRouter = Router();

/** js doc comments
 * @route POST /api/auth/register
 * @description Register a new user 
 * @access Public
 */

authRouter.post("/register", authController.registerUserController)

/**
 * @route POST /api/auth/login
 * @description Login user with email and password
 * @access Public
 */

authRouter.post("/login", authController.loginUserController)


/**
 * @route POST /api/auth/logout
 * @description Logout user : clear token from user cookie and add token to blacklist
 * @access public
 */

authRouter.post("/logout", authController.logoutUserController)


module.exports = authRouter;