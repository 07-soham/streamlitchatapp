import { generateToken } from "../lib/utils.js"
import User from "../models/User.js"
import Message from "../models/Message.js"
import Room from "../models/Room.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"


//controller to check if user is authenticated
export const checkAuth = async (req, res) => {
    res.json({ success: true, user: req.user, message: "User is authenticated" });
}

// cotroller to update the user profile
export const updateProfile = async (req, res) => {
    try {
        const { fullName, profilePic, bio } = req.body;
        const userId = req.user._id;

        let updatedUser;  

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { bio, fullName },  // only the bio and fulName will be updated if the profilePic is not provided
                { new: true }  // returns the updated data after update
            );
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    profilePic: upload.secure_url,
                    bio,
                    fullName
                },
                { new: true }
            );
        }

        res.json({ success: true, user: updatedUser, message: "Profile updated successfully" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// get user stats for dashboard
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const [messagesSent, roomsCount, totalUsers] = await Promise.all([
            Message.countDocuments({ senderId: userId }),
            Room.countDocuments({ members: userId, isExpired: { $ne: true } }),
            User.countDocuments({ _id: { $ne: userId } })
        ]);

        // Calculate 24-hour activity (messages sent per hour)
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const activity = await Message.aggregate([
            {
                $match: {
                    senderId: userId,
                    createdAt: { $gte: twentyFourHoursAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Fill in missing hours with 0
        const activityData = [];
        for (let i = 0; i < 24; i++) {
            const date = new Date();
            date.setHours(date.getHours() - (23 - i));
            const hourStr = date.toISOString().slice(0, 13).replace("T", " ") + ":00";
            const displayTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const hourData = activity.find(a => a._id === hourStr);
            activityData.push({
                time: displayTime,
                active: hourData ? hourData.count : 0
            });
        }

        res.json({
            success: true,
            stats: {
                messagesSent,
                activeRooms: roomsCount,
                totalUsers,
                activityData
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
