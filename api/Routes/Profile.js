const { Router } = require("express");
const { userModel, profileModel } = require("../db");
const cors = require("cors");
const { sessionMiddleware } = require("../middlewares/session");
const profileRoute = Router();

profileRoute.use( 
  cors({ 
    origin: "http://127.0.0.1:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

profileRoute.get("/profile", sessionMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }
    const profile = await profileModel.findOne({ studentId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }
    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving profile",
      error: error.message,
    });
  }
});

profileRoute.post("/profile", sessionMiddleware, async (req, res) => {
  try {
    const { fullName, phoneNumber, CATscore, gradSchool } = req.body;
    const studentId = req.user.id;

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    const profile = await profileModel.findOneAndUpdate(
      { studentId },
      {
        studentId,
        fullName,
        phoneNumber,
        CATscore,
        gradSchool,
        updatedAt: Date.now(),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
});

module.exports = profileRoute;