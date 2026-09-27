const orders = require("../models/order");


const updated_status = async (req, res) => {
    try {

        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
                data: []
            });
        }

        const order_id = req.body.order_id;

        const the_new_status = req.body.status_order;

        if (!order_id || !the_new_status) {
            return res.status(400).json({
                success: false,
                message: "order_id and status_order are required",
                data: []
            });
        }

        const seller_id = user._id.toString();

        const update_status = await orders.findOneAndUpdate(
            {
                _id: order_id,
                "products.seller_id": seller_id
            },
            {
                status: the_new_status,
            },
            { new: true }
        );

        if (!update_status) {
            return res.status(404).json({
                success: false,
                message: "order not found",
                data: []
            });
        }

        // RESPONSE
        req.io.to("users").emit("update_status", {
            status: update_status
        });
        return res.status(200).json({
            success: true,
            message: "updated successfully",
            data: update_status
        });
    }
    catch (e) {
        console.log(e.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        });
    }
};

module.exports = updated_status;