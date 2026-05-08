const { Router } = require("express")
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middleware/auth.middleware")


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

authRouter.get("/logout", authController.logoutUserController)


/**
 * @route GET /api/auth/profile
 * @description Get user profile : get user details from token and return user details
 * @access Private
 */

authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)


module.exports = authRouter;