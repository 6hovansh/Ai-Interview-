const express = require("express");
const authmiddleware = require("../middleware/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middleware/file.middleware");

const interviewRouter = express.Router();


/**
 * @route POST /api/interview/
 * @description Generate an interview report for a candidate based on their resume, self description and job description
 * @access private
 */

interviewRouter.post("/", authmiddleware.authUser, upload.single("resume"), interviewController.generateInterviewReportController);

module.exports = interviewRouter;