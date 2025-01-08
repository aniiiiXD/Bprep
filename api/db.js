const mongoose = require("mongoose");
const Schema = mongoose.Schema;
 
const userSchema = new mongoose.Schema({
  googleId: String,
  email: String,
  fullName: String,
  profilePicture: String,
  authSource: { type: String, default: "google" },
  name: String, 
  phoneNumber: String,
  CATscore: Number,
  QApercentile: Number,
  DILRpercentile: Number,
  VARCpercentile: Number,
  BSchools: String,
  WorkExp: String,
  gradSchool: String,
});

const interviewQuestionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  userAnswer: {
    type: String,
    default: "",
    trim: true,
  },
  status: {
    type: String,
    enum: ["Not Started", "In Progress", "Completed"],
    default: "Not Started",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update timestamp on save
interviewQuestionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const UserModel = mongoose.model("User", userSchema);
const InterviewQuestionModel = mongoose.model(
  "InterviewQuestion",
  interviewQuestionSchema
);

module.exports = {
  UserModel,
  InterviewQuestionModel,
};
