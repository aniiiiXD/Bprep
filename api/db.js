const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// User Schema
const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  firstName: String,
  lastName: String,
  profilePicture: String,
  authSource: { type: String, default: 'google' },
});

const mentorSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});

const followUpSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const initialQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  followUps: { type: [followUpSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Static method to retrieve initial questions
initialQuestionSchema.statics.getInitialQuestions = function () {
  return generateOriginalQuestions();
};

// Interview Schema for user-specific questions
const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  question: { type: String, required: true },
  userAnswer: { type: String, default: null },
  followUps: { type: [followUpSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Generate Original Questions
function generateOriginalQuestions() {
  const originalQuestions = [
    { question: "Tell me about yourself.", followUps: 5 },
    { question: "Why MBA?", followUps: 2 },
    // ... Add other questions
  ];

  return originalQuestions.map((q) => ({
    question: q.question,
    followUps: Array.from({ length: q.followUps }, (_, index) => ({
      question: `Follow-up ${index + 1} for "${q.question}"`,
      answer: "",
    })),
  }));
}

// Populate Initial Questions in the database if not present
async function populateInitialQuestions() {
  try {
    const count = await InitialQuestionModel.countDocuments();
    if (count === 0) {
      const questions = generateOriginalQuestions();
      await InitialQuestionModel.insertMany(questions);
      console.log("Initial questions populated successfully.");
    } else {
      console.log("Initial questions already exist.");
    }
  } catch (error) {
    console.error("Error populating initial questions:", error);
  }
}

// Initialize Questions for a User
async function initializeQuestionsForUser(userId) {
  if (!userId) throw new Error("User ID is required");

  try {
    const existingQuestions = await InterviewModel.find({ userId });
    if (existingQuestions.length > 0) {
      return { message: "User already has interview questions." };
    }

    const initialQuestions = await InitialQuestionModel.find({});
    if (initialQuestions.length === 0) {
      throw new Error("No initial questions available.");
    }

    const userQuestions = initialQuestions.map((q) => ({
      userId,
      question: q.question,
      followUps: q.followUps.map((fu) => ({ ...fu })),
    }));

    const createdQuestions = await InterviewModel.insertMany(userQuestions);
    return createdQuestions;
  } catch (error) {
    throw new Error(`Error initializing questions for user: ${error.message}`);
  }
}

// Add a Follow-Up Question
async function addFollowUp(userId, questionId, followUpData) {
  if (!userId || !questionId) throw new Error("User ID and Question ID are required");

  try {
    const question = await InterviewModel.findOne({ userId, _id: questionId });
    if (!question) throw new Error("Question not found.");

    question.followUps.push(followUpData);
    await question.save();
    return question;
  } catch (error) {
    throw new Error(`Error adding follow-up: ${error.message}`);
  }
}

// Get User Questions
async function getQuestionsForUser(userId) {
  if (!userId) throw new Error("User ID is required");

  try {
    const questions = await InterviewModel.find({ userId }).sort({ createdAt: -1 });
    return questions;
  } catch (error) {
    throw new Error(`Error retrieving user questions: ${error.message}`);
  }
}

// Initialize Models
const UserModel = mongoose.model("user", userSchema);
const MentorModel = mongoose.model("Mentor", mentorSchema);
const InitialQuestionModel = mongoose.model("InitialQuestion", initialQuestionSchema);
const InterviewModel = mongoose.model("Interview", interviewSchema);

// Populate initial questions on startup
populateInitialQuestions();

module.exports = {
  UserModel,
  MentorModel,
  InitialQuestionModel,
  InterviewModel,
  initializeQuestionsForUser,
  addFollowUp,
  getQuestionsForUser,
};
