const pdfParse = require("pdf-parse")
const generateInterviewReport = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

async function generateInterviewReportController(req, res) {

    const resumeContent = await (new pdfParse.PDFParse(new Uint8Array(req.file.buffer))).getText()
    const { selfDescription, jobDescription } = req.body

    const interviewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    })

    console.log("AI RESPONSE:");
    console.log(JSON.stringify(interviewReportByAi, null, 2));

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interviewReportByAi //spread operator(...) ,This spreads all properties from interviewReportByAi into the object.
    })

    res.status(201).json({
        message: "Interview report generated successfully",
        interviewReport
    })
}

module.exports = generateInterviewReportController
