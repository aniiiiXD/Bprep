const { Router } = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { UserModel, InterviewModel } = require("../db");
const { sessionMiddleware } = require("../middlewares/session");
const { generateFollowUpQuestions } = require("../utils/ai");
const { validateUserSession } = require("../utils/helpers");

const interviewRouter = Router();

// Initial Interview Submission with AI-generated Follow-ups
interviewRouter.post("/interview", sessionMiddleware, async (req, res) => {
  try {
    const studentId = validateUserSession(req);
    const { question, answer, numberOfFollowUps = 5 } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ 
        success: false, 
        message: "Question and Answer are required" 
      });
    }

    // Generate follow-up questions using AI
    const followUpQuestions = await generateFollowUpQuestions(
      question, 
      answer, 
      numberOfFollowUps
    );

    // Find or create an interview document for the user
    let interview = await InterviewModel.findOne({ userId: studentId });
    
    if (!interview) {
      // Create new interview if not exists
      interview = new InterviewModel({
        userId: studentId,
        questions: [{
          question,
          userAnswer: answer,
          followUps: followUpQuestions.map((q) => ({ 
            question: q,
            answer: '',
            createdAt: Date.now(),
            updatedAt: Date.now()
          }))
        }]
      });
    } else {
      // Add new question to existing interview
      interview.questions.push({
        question,
        userAnswer: answer,
        followUps: followUpQuestions.map((q) => ({ 
          question: q,
          answer: '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }))
      });
    }

    // Save the interview
    await interview.save();

    return res.status(200).json({
      success: true,
      followUpQuestions,
      interview
    });
  } catch (error) {
    console.error("Error generating follow-up questions:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal server error" 
    });
  }
});

// Submit Answers for Follow-up Questions
interviewRouter.post("/interview-followup", sessionMiddleware, async (req, res) => {
  try {
    const studentId = validateUserSession(req);
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ 
        success: false, 
        message: "Answers must be an array" 
      });
    }

    const interview = await InterviewModel.findOne({ userId: studentId });
    
    if (!interview || interview.questions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No interview data found" 
      });
    }

    const lastQuestion = interview.questions[interview.questions.length - 1];
    
    if (lastQuestion.followUps.length !== answers.length) {
      return res.status(400).json({ 
        success: false, 
        message: "Answer count does not match follow-up count" 
      });
    }

    // Update follow-up answers
    lastQuestion.followUps.forEach((followUp, index) => {
      followUp.answer = answers[index];
      followUp.updatedAt = Date.now();
    });

    await interview.save();

    return res.status(200).json({ 
      success: true, 
      message: "Follow-up answers submitted successfully" 
    });
  } catch (error) {
    console.error("Error submitting follow-up answers:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

module.exports = interviewRouter;