const express = require("express")
const cookieParser = require("cookie-parser")


const app = express()
 
app.use (express.json())
app.use(cookieParser())

/* Require all the routes here */
const authRouter = require("./routes/auth.routes")

/* Using all the routes here */
app.use("/api/auth",authRouter)


/**
 * @route POST /api/auth/register
 * @description Register a new user 
 * @access Public
 */

authRouter.post("/register", (req, res) => {
    res.send("Register route working");
})
  
module.exports = app