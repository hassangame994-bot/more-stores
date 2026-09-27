const promotion_requests = require("../models/Promotion_requests_for_salesperson");



const promotion_requests_for_salesperson = async(req,res)=>{
    try{

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
                data: []
            });
        }

        const user_name = req.body.name?.trim();

        const email = req.body.email?.trim().toLowerCase();

        const description = req.body.description?.trim();

        const phone_number = req.body.phone_number?.trim();

        const GPS_URL = req.body.GPS_URL?.trim();

        const whatsApp_number = req.body.whatsApp_number?.trim();


        // ==============================
        // Validate required data
        // ==============================

        if (
            !user_name ||
            !email ||
            !description||
            !phone_number ||
            !whatsApp_number ||
            !GPS_URL
        ) {
            return res.status(400).json({
                success: false,
                message: `Name, email , phone number , whatsApp number , GPS URL are required and description`
            });
        }

        const add_request = new promotion_requests({
            name: user_name,

            email: email,

            description: description,

            phone_number: phone_number,

            GPS_URL: GPS_URL,

            whatsApp_number: whatsApp_number,

        });

        await add_request.save()

            return res.status(201).json({
                success: true,
                message:"added successful"
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

module.exports = promotion_requests_for_salesperson