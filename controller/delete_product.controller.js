const products = require("../models/products");
const mongoose = require("mongoose");
const cache = require("../utils/cache");

// This route is protected by the auth_seller middleware
// (routes/delete_product.router.js), which verifies the JWT,
// confirms the requester's role is "seller", and attaches them to
// req.user - so seller identity is read from req.user, never from
// req.body.

const DEL_product = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
                data: []
            });
        }

        const product_id = req.body.product_id;

        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: "product id is required",
                data: []
            })
        }

        if (!mongoose.Types.ObjectId.isValid(product_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product id",
                data: []
            })
        }

        // FIX: seller identity must come from the authenticated user,
        // never from the client - the previous code trusted
        // `req.body.user_id` and matched against a `user_id` field
        // that doesn't exist in the products schema (see
        // models/products.js, which only has `seller_id`), so this
        // query never matched anything and no seller could ever
        // delete their own product. It also had no auth check at
        // all, so any request with a product_id would attempt the
        // delete regardless of who sent it.
        const seller_id = req.user._id.toString();

        const deleted_product = await products.findOneAndDelete({
            _id: product_id,
            seller_id: seller_id
        });

        if (!deleted_product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
                data: []
            });
        }
        await cache.delByPrefix("products:");
        req.io.to("users").emit("deleted_product", {
            deleted_product: deleted_product
        });
        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
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

module.exports = DEL_product