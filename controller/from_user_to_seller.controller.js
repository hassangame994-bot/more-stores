const users = require("../models/users");
const mongoose = require("mongoose");

// This route is protected by the auth_super_admin middleware
// (routes/from_user_to_seller.router.js), which already verifies the
// JWT, confirms the requester's role is "super_admin", and attaches
// them to req.user - no need to re-verify anything here.

const upgrade_user_to_seller = async(req,res)=>{
    try{
        // FIX: this controller used to do its own manual
        // cookie/JWT verification, duplicating what auth_super_admin
        // already does on the route - and unlike the middleware, it
        // never checked the requester's role at all. Relying on
        // req.user (set by the middleware) instead removes the
        // duplicate logic and keeps the role check in one place.
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
                data: []
            });
        }

        const user_id = req.body.user_id

        if(!user_id){
            return res.status(400).json({
                success:false,
                message:"user_id is required",
                data:[]
            })
        }

        // FIX (new): validate the id format before hitting the DB,
        // so a malformed id returns a clean 400 instead of an
        // uncaught CastError falling through to the generic 500
        // handler.
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({
                success: false,
                message: "invalid user_id",
                data: []
            });
        }

        const upgraded_user = await users.findOneAndUpdate(
            { _id: user_id },
            { role: "seller" },
            { new: true }
        )

        if(!upgraded_user){
        return res.status(404).json({
            success: false,
            message: "user not found",
            data:[]
        });
        }

        req.io.to("users").emit("upgrade_user", {
        upgrade_user: upgraded_user
        });

        return res.status(200).json({
            success: true,
            message: "upgrade successful",
            data:upgraded_user
        });
    }
    catch(e){
        console.log(e.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        });
    }
}
module.exports = upgrade_user_to_seller