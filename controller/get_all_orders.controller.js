const orders = require("../models/order");

const get_all_orders = async (req, res) => {
    try {

        // ==============================
        // Filters / Pagination
        // ==============================

        const seller_id = req.query.seller_id;

        const limit = Math.min(
            parseInt(req.query.limit) || 10,
            50
        );

        const page = Math.max(
            parseInt(req.query.page) || 1,
            1
        );

        const skip = (page - 1) * limit;


        const filter = {};

        if (seller_id) {
            filter["products.seller_id"] = seller_id;
        }

        // ==============================
        // Get Orders
        // ==============================

        const all_orders = await orders
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalOrders = await orders.countDocuments(filter);

        const totalPages = Math.ceil(
            totalOrders / limit
        );

        // ==============================
        // No Orders
        // ==============================

        if (all_orders.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Orders were not found",
                data: [],
                pagination: {
                    page,
                    limit,
                    totalOrders,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            });
        }

        // ==============================
        // Response
        // ==============================

        return res.status(200).json({
            success: true,
            message: "successfully",
            data: all_orders,
            pagination: {
                page,
                limit,
                totalOrders,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
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

module.exports = get_all_orders;