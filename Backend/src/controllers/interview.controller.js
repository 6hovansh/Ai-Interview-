const mongoose = require("mongoose")
const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const interviewSessionModel = require("../models/interviewSession.model")


/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume PDF is required." })
        }

        const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()

        if (!resumeContent?.text?.trim()) {
            return res.status(422).json({
                message: "Could not read any text from this PDF. Please upload a text-based resume (not a scanned image)."
            })
        }

        const { selfDescription, jobDescription } = req.body

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        })

        if (!interViewReportByAi?.title) {
            return res.status(502).json({ message: "AI failed to generate a complete report. Please try again." })
        }

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (err) {
        console.error("generateInterViewReport failed:", err)
        res.status(500).json({ message: "Something went wrong while generating the report. Please try again." })
    }
}


/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        if (!mongoose.isValidObjectId(interviewId)) {
            return res.status(400).json({ message: "Invalid interview report id." })
        }

        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (err) {
        console.error("getInterviewReportById failed:", err)
        res.status(500).json({ message: "Could not fetch the interview report." })
    }
}


/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (err) {
        console.error("getAllInterviewReports failed:", err)
        res.status(500).json({ message: "Could not fetch interview reports." })
    }
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        if (!mongoose.isValidObjectId(interviewReportId)) {
            return res.status(400).json({ message: "Invalid interview report id." })
        }

        // owner check: a user can only generate a PDF from their own report
        const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)
    } catch (err) {
        console.error("generateResumePdf failed:", err)
        res.status(500).json({ message: "Could not generate the resume PDF. Please try again." })
    }
}


/**
 * @description Controller to start a voice interview from an existing interview report.
 */
async function startVoiceInterviewController(req, res) {
    try {
        const { interviewReportId, level = "junior" } = req.body

        if (!mongoose.isValidObjectId(interviewReportId)) {
            return res.status(400).json({ message: "Invalid interview report id." })
        }
        if (!["intern", "junior", "mid"].includes(level)) {
            return res.status(400).json({ message: "Invalid level." })
        }

        const report = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })
        if (!report) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        // handles questions stored as strings or as objects like { question, ... }
        const toText = (q) => (typeof q === "string" ? q : q?.question)

        const questionPlan = [
            ...(report.technicalQuestions || []).slice(0, 5).map(toText),
            ...(report.behavioralQuestions || []).slice(0, 3).map(toText),
        ].filter(Boolean)

        if (questionPlan.length === 0) {
            return res.status(422).json({ message: "This report has no questions to base an interview on." })
        }

        const role = report.title
        const resumeSummary = [report.selfDescription, report.resume]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .slice(0, 900)

        const session = await interviewSessionModel.create({
            user: req.user.id,
            interviewReport: report._id,
            role,
            level,
            questionPlan,
        })

        res.status(201).json({
            sessionId: session._id,
            variableValues: {
                sessionId: session._id.toString(),
                role,
                level,
                questionPlan: questionPlan.join("; "),
                resumeSummary,
            },
        })
    } catch (err) {
        console.error("startVoiceInterview failed:", err)
        res.status(500).json({ message: "Could not start voice interview." })
    }
}


module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController,
    startVoiceInterviewController
}