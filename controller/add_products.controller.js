require("dotenv").config();

const products = require("../models/products");
const mongoose = require("mongoose");
const cache = require("../utils/cache");

const add_product = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
                data: []
            });
        }

        const product_name = req.body.product_name;
        const product_description = req.body.product_description;
        const product_discount = Number(req.body.product_discount || 0);
        const product_price = Number(req.body.product_price);
        const quantity = Number(req.body.quantity);
        const section_id = req.body.section;

        // FIX: seller identity must come from the authenticated user
        // (set by auth_seller), never from the client - the previous
        // code trusted `req.body.user_id` and saved it under a
        // `user_id` field that doesn't even exist in the products
        // schema (see models/products.js, which only has
        // `seller_id`). That meant `seller_id` was never actually
        // set on any product, silently breaking get_seller_products,
        // delete_product, and per-seller order filtering, all of
        // which query/match on `seller_id`. It would also have let
        // any seller claim a product on behalf of another user.
        const seller_id = req.user._id.toString();

        let images = [];
        if (Array.isArray(req.body.images)) {
            images = req.body.images.filter((img) => typeof img === "string" && img.trim() !== "");
        } else if (typeof req.body.images === "string" && req.body.images.trim()) {
            images = [req.body.images.trim()];
        } else if (typeof req.body.image === "string" && req.body.image.trim()) {
            images = [req.body.image.trim()];
        }

        if (!mongoose.Types.ObjectId.isValid(section_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid section id",
                data: []
            });
        }

        if (
            !product_name ||
            !product_description ||
            isNaN(product_price) ||
            isNaN(product_discount) ||
            images.length === 0 ||
            !section_id ||
            isNaN(quantity) ||
            quantity < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Product name, description, price, discount, at least one image, valid quantity and section are required",
                data: []
            });
        }

        const final_price = product_price * (1 - product_discount / 100);

        const new_product = new products({
            name: product_name,
            description: product_description,
            price: product_price,
            discount: product_discount,
            final_price: final_price,
            images: images,
            quantity: quantity,
            section: section_id,
            seller_id: seller_id,
            reviews: []
        });

        await new_product.save();

        await cache.delByPrefix("products:");

        if (req.io) {
            req.io.to("users").emit("new_product", {
                product: new_product
            });
        }

        return res.status(201).json({
            success: true,
            message: "add successfully",
            data: new_product
        });

    } catch (e) {
        console.error("Add product error:", e.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: e.message
        });
    }
};

module.exports = add_product;