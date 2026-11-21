const mongoose = require("mongoose")

const interviewSessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    interviewReport: { type: mongoose.Schema.Types.ObjectId, ref: "InterviewReport", required: true },
    role: String,
    level: String,
    questionPlan: [String],
    status: { type: String, enum: ["created", "completed", "evaluated"], default: "created" },
    transcript: [{ role: String, text: String }],
    summary: String,
    vapiCallId: String,
    evaluation: Object
}, { timestamps: true })

module.exports = mongoose.model("InterviewSession", interviewSessionSchema)