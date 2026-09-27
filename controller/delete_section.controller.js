const section = require("../models/section");
const mongoose = require("mongoose");
const cache = require("../utils/cache")



const DEL_section = async (req, res) => {
    try {
        const section_id = req.body.section_id;

        if (!section_id) {
            return res.status(400).json({
                success: false,
                message: "section id is required",
                data: []
            })
        }


        if (!mongoose.Types.ObjectId.isValid(section_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section id",
                data: []
            })
        }

        const deleted_section = await section.findByIdAndDelete(section_id);

        if (!deleted_section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
                data: []
            });
        }
        await cache.del("sections");
        req.io.to("users").emit("deleted_section", {
            deleted_section: deleted_section
        });
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully",
            data: []
        });
    }
    catch (e) {
        console.log(e.message)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        })
    }
}

module.exports = DEL_section