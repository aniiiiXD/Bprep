// Routes/Question.js
const express = require('express');
const router = express.Router();
const { InterviewQuestionModel } = require('../db');
const { sessionMiddleware } = require('../middlewares/session');

// Default MBA questions - you can move this to a separate config file if needed
const DEFAULT_QUESTIONS = [
    "Tell me about yourself and your background",
    "Why do you want to pursue an MBA?",
    "What are your short-term and long-term career goals?",
    "Describe a challenging situation you've faced at work and how you resolved it",
    "How do you plan to contribute to our MBA program?"
];

// Apply session middleware
router.use(sessionMiddleware);

// Get all questions for the user
router.get('/questions', async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user's existing questions
        let questions = await InterviewQuestionModel.find({ userId });
        
        // If user has no questions, create default ones
        if (questions.length === 0) {
            const defaultQuestions = DEFAULT_QUESTIONS.map(question => ({
                userId,
                question,
                userAnswer: '',
                status: 'Not Started'
            }));
            
            questions = await InterviewQuestionModel.insertMany(defaultQuestions);
        }
        
        res.json({ success: true, questions });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching questions',
            error: error.message 
        });
    }
});

// Create a new question
router.post('/questions', async (req, res) => {
    try {
        const userId = req.user.id;
        const { question } = req.body;
        
        const newQuestion = await InterviewQuestionModel.create({
            userId,
            question,
            userAnswer: '',
            status: 'Not Started'
        });
        
        res.status(201).json({ success: true, question: newQuestion });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating question',
            error: error.message 
        });
    }
});

// Update a question
router.put('/questions/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const questionId = req.params.id;
        const updates = req.body;
        
        const question = await InterviewQuestionModel.findOneAndUpdate(
            { _id: questionId, userId },
            { ...updates, updatedAt: new Date() },
            { new: true }
        );
        
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found or unauthorized'
            });
        }
        
        res.json({ success: true, question });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error updating question',
            error: error.message 
        });
    }
});

// Delete a question
router.delete('/questions/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const questionId = req.params.id;
        
        const result = await InterviewQuestionModel.findOneAndDelete({
            _id: questionId,
            userId
        });
        
        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Question not found or unauthorized'
            });
        }
        
        res.json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting question',
            error: error.message 
        });
    }
});

module.exports = router;