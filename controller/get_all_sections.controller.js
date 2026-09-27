require("dotenv").config();

const sections = require("../models/section");
const cache = require("../utils/cache");

const get_all_sections = async (req, res) => {
    try {

        // Check Cache
        const cachedSections = await cache.get("sections");

        if (cachedSections) {
            console.log("Sections from CACHE");

            return res.status(200).json({
                success: true,
                message: "successfully",
                data: cachedSections
            });
        }


        const all_sections = await sections.find().lean();

        if (all_sections.length === 0) {
            return res.status(200).json({
                success: true,
                message: "no sections found",
                data: []
            });
        }

        // Save sections in Cache
        await cache.set("sections", all_sections);

        console.log("Sections from DATABASE");

        return res.status(200).json({
            success: true,
            message: "successfully",
            data: all_sections
        });

    } catch (e) {

        console.log(e.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        });
    }
};

module.exports = get_all_sections;