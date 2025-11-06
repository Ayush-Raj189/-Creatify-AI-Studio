//Middleware to check UserId and has Premium Plan

import { clerkClient } from "@clerk/express";

export const auth = async (req, res, next) => {
    try {
        const authData = await req.auth();
        const { userId, sessionClaims } = authData;
        
        // Check the 'pla' claim directly
        const planClaim = sessionClaims.pla; // Will be 'u:premium' or 'u:free_user'
        const hasPremiumPlan = planClaim === 'u:premium';
        
        console.log("Plan claim:", planClaim);
        console.log("Has premium:", hasPremiumPlan);

        const user = await clerkClient.users.getUser(userId);

        if (!hasPremiumPlan && user.privateMetadata.free_usage) {
            req.free_usage = user.privateMetadata.free_usage;
        } else {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: 0 },
            });
            req.free_usage = 0;
        }
        
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        console.log("req.plan:", req.plan);
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};