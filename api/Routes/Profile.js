const express = require('express');
const ProfileRouter = express.Router();
const { UserModel } = require('../db');
const { sessionMiddleware } = require('../middlewares/session');

// Get user profile
ProfileRouter.get('/profile', sessionMiddleware, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            profile: {
                name: user.name || '',
                phoneNumber: user.phoneNumber || '',
                CATscore: user.CATscore || '',
                QApercentile: user.QApercentile || '',
                DILRpercentile: user.DILRpercentile || '',
                VARCpercentile: user.VARCpercentile || '',
                BSchools: user.BSchools || '',
                WorkExp: user.WorkExp || '',
                gradSchool: user.gradSchool || ''
            }
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
});

// Update profile
ProfileRouter.put('/profile', sessionMiddleware, async (req, res) => {
    try {
        const {
            name,
            phoneNumber,
            CATscore,
            QApercentile,
            DILRpercentile,
            VARCpercentile,
            BSchools,
            WorkExp,
            gradSchool
        } = req.body;

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.user.id,
            {
                name,
                phoneNumber,
                CATscore,
                QApercentile,
                DILRpercentile,
                VARCpercentile,
                BSchools,
                WorkExp,
                gradSchool
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: {
                name: updatedUser.name,
                phoneNumber: updatedUser.phoneNumber,
                CATscore: updatedUser.CATscore,
                QApercentile: updatedUser.QApercentile,
                DILRpercentile: updatedUser.DILRpercentile,
                VARCpercentile: updatedUser.VARCpercentile,
                BSchools: updatedUser.BSchools,
                WorkExp: updatedUser.WorkExp,
                gradSchool: updatedUser.gradSchool
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({ success: false, message: 'Error updating profile' });
    }
});

module.exports = ProfileRouter;