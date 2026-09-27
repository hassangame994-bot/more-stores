require("dotenv").config();
const section = require("../models/section");
const cache = require("../utils/cache");

const add_section = async(req,res)=>{
    try{

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
                data: []
            });
        }

        // requirement to add section
        const section_name = req.body.section_name
        if(!section_name){

            return res.status(400).json({
                success:false,
                message:"section_name is required",
                data:[]
            })

        }
        const new_section = new section({
            name:section_name,
        });

        await new_section.save()
        await cache.del("sections");


        if (req.io) {
            req.io.to("users").emit("new_section", {
                section: new_section
            });
        }
        // RESPONSE

        return res.status(201).json({
            success:true,
            message:"add successfully",
            data:new_section
        })

    }
    catch(e){
        console.log(e.message)
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:e.message
        })
    }
}
module.exports = add_section