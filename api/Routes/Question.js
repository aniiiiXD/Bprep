const { Router } = require('express');
const { InterviewModel } = require('../db');
const { sessionMiddleware } = require('../middlewares/session');
const { validateUserSession } = require('../utils/helpers');

const questionsRouter = Router();

// Helper function: Get question by ID and user
async function getQuestionById(userId, questionId) {
  return InterviewModel.findOne({ 
    userId, 
    'questions._id': questionId 
  });
}

// Get all interview questions for a user
questionsRouter.get('/questions', sessionMiddleware, async (req, res) => {
  try {
    const userId = validateUserSession(req);
    const { type } = req.query; // `type=initial` for initial questions

    let questions;
    if (type === 'initial') {
      questions = await InitialQuestionModel.find({});
    } else {
      questions = await InterviewModel.find({ userId });
    }

    if (!questions || questions.length === 0) {
      return res.status(404).json({ success: false, message: "No questions found" });
    }

    return res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update an existing question
questionsRouter.put('/questions/:questionId', sessionMiddleware, async (req, res) => {
  try {
    const userId = validateUserSession(req);
    const { questionId } = req.params;
    const { question, userAnswer } = req.body;

    const interview = await InterviewModel.findOne({ userId });
    if (!interview) {
      return res.status(404).json({ 
        success: false, 
        message: "Interview not found" 
      });
    }

    const questionToUpdate = interview.questions.id(questionId);
    if (!questionToUpdate) {
      return res.status(404).json({ 
        success: false, 
        message: "Question not found" 
      });
    }

    if (question) questionToUpdate.question = question;
    if (userAnswer !== undefined) questionToUpdate.userAnswer = userAnswer;
    questionToUpdate.updatedAt = Date.now();

    await interview.save();
    return res.status(200).json({ 
      success: true, 
      question: questionToUpdate, 
      message: "Question updated successfully" 
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Delete an existing question
questionsRouter.delete('/questions/:questionId', sessionMiddleware, async (req, res) => {
  try {
    const userId = validateUserSession(req);
    const { questionId } = req.params;

    const interview = await InterviewModel.findOne({ userId });
    if (!interview) {
      return res.status(404).json({ 
        success: false, 
        message: "Interview not found" 
      });
    }

    const questionIndex = interview.questions.findIndex(q => q._id.toString() === questionId);
    if (questionIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Question not found" 
      });
    }

    interview.questions.splice(questionIndex, 1);
    await interview.save();

    return res.status(200).json({ 
      success: true, 
      message: "Question deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Add a follow-up question to an existing question
questionsRouter.post('/questions/:questionId/followups', sessionMiddleware, async (req, res) => {
  try {
    const userId = validateUserSession(req);
    const { questionId } = req.params;
    const { question, answer = '' } = req.body;

    if (!question) {
      return res.status(400).json({ 
        success: false, 
        message: "Follow-up question is required" 
      });
    }

    const interview = await InterviewModel.findOne({ userId });
    if (!interview) {
      return res.status(404).json({ 
        success: false, 
        message: "Interview not found" 
      });
    }

    const parentQuestion = interview.questions.id(questionId);
    if (!parentQuestion) {
      return res.status(404).json({ 
        success: false, 
        message: "Parent question not found" 
      });
    }

    const newFollowUp = { 
      question, 
      answer, 
      createdAt: Date.now(), 
      updatedAt: Date.now() 
    };

    parentQuestion.followUps.push(newFollowUp);
    await interview.save();

    return res.status(201).json({
      success: true,
      followUp: newFollowUp,
      message: "Follow-up question added successfully"
    });
  } catch (error) {
    console.error("Error adding follow-up question:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Update a specific follow-up question
questionsRouter.put('/questions/:questionId/followups/:followUpId', sessionMiddleware, async (req, res) => {
  try {
    const userId = validateUserSession(req);
    const { questionId, followUpId } = req.params;
    const { question, answer } = req.body;

    const interview = await InterviewModel.findOne({ userId });
    if (!interview) {
      return res.status(404).json({ 
        success: false, 
        message: "Interview not found" 
      });
    }

    const parentQuestion = interview.questions.id(questionId);
    if (!parentQuestion) {
      return res.status(404).json({ 
        success: false, 
        message: "Parent question not found" 
      });
    }

    const followUp = parentQuestion.followUps.id(followUpId);
    if (!followUp) {
      return res.status(404).json({ 
        success: false, 
        message: "Follow-up question not found" 
      });
    }

    if (question) followUp.question = question;
    if (answer !== undefined) followUp.answer = answer;
    followUp.updatedAt = Date.now();

    await interview.save();
    return res.status(200).json({ 
      success: true, 
      followUp, 
      message: "Follow-up question updated successfully" 
    });
  } catch (error) {
    console.error("Error updating follow-up question:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Delete a specific follow-up question
questionsRouter.delete('/questions/:questionId/followups/:followUpId', sessionMiddleware, async (req, res) => {
  try {
    const userId = validateUserSession(req);
    const { questionId, followUpId } = req.params;

    const interview = await InterviewModel.findOne({ userId });
    if (!interview) {
      return res.status(404).json({ 
        success: false, 
        message: "Interview not found" 
      });
    }

    const parentQuestion = interview.questions.id(questionId);
    if (!parentQuestion) {
      return res.status(404).json({ 
        success: false, 
        message: "Parent question not found" 
      });
    }

    const followUpIndex = parentQuestion.followUps.findIndex(
      fu => fu._id.toString() === followUpId
    );

    if (followUpIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: "Follow-up question not found" 
      });
    }

    parentQuestion.followUps.splice(followUpIndex, 1);
    await interview.save();

    return res.status(200).json({ 
      success: true, 
      message: "Follow-up question deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting follow-up question:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = questionsRouter;