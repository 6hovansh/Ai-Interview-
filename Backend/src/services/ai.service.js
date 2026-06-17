const { GoogleGenAI } = require("@google/genai");
const { z, json } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

const interviewReportSchema = z.object({
    matchScore: z.number().describe("The match score between the candidate's profile and the job description, calculated based on the resume, self description and job description").describe("The match score between the candidate's profile and the job description"),

    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intension: z.string().describe("The intension of the interviewer behind asking this question "),
        answer: z.string().describe("How to answer this question, what points to cover,what approch to take etc.")
    }).describe("Technical questions that can be asked in the interview along with their intension and how to answer them")),

    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intension: z.string().describe("The intension of the interviewer behind asking this question "),
        answer: z.string().describe("How to answer this question, what points to cover,what approch to take etc.")
    }).describe("Behavioral questions that can be asked in the interview along with their intension and how to answer them")),

    skillGap: z.array(z.object({
        skill: z.string().describe("The skill that the candidate is lacking in"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of the skill gap, how much the candidate is lacking in this skill")
    }).describe("The list of skill gaps in the candidate's profilealong with their severity")),

    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number of the preparation plan"),
        focus: z.string().describe("The focus of the day, what to focus on"),
        tasks: z.array(z.string()).describe("The list of tasks to be done on that day")
    }).describe("The preparation plan for the candidate, what to do on each day to prepare for the interview"))
})




async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate based on the following information:

                             Resume: ${resume}
                             self Description: ${selfDescription}
                             Job Description: ${jobDescription}
                        `



    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema)
        }
    })

    
     return JSON.parse(response.text);

}


module.exports = generateInterviewReport;
