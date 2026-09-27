require("dotenv").config();
const orders = require("../models/order");
const mongoose = require("mongoose");

// This route is protected by the auth_seller middleware
// (routes/delete_order.router.js), which verifies the JWT, confirms
// the requester's role is "seller", and attaches them to req.user -
// so seller identity is read from req.user, never from req.body.

const DEL_order = async(req,res)=>{
    try{
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated",
                data: []
            });
        }

        const order_id = req.body.order_id;

        if(!order_id){
            return res.status(400).json({
                success:false,
                message:"order_id is required",
                data:[]
            })
        }

        if (!mongoose.Types.ObjectId.isValid(order_id)) {
            return res.status(400).json({
                success: false,
                message: "invalid order id",
                data: []
            });
        }

        // Seller identity comes from the authenticated user, never
        // from the request body - trusting a client-supplied id
        // would let any seller delete any other seller's (or
        // customer's) order.
        const seller_id = req.user._id.toString();

        // FIX: this route now runs as auth_seller, not
        // auth_super_admin, but the query used to match on the
        // order's customer (`user_id`) with no relation to the
        // seller at all - any authenticated seller could delete any
        // order in the system just by guessing/knowing a customer's
        // id. It now scopes the update to orders that actually
        // contain one of this seller's products.
        //
        // NOTE: orders can contain products from multiple sellers
        // (see models/order.js), so a full document delete would
        // wipe out other sellers' line items too. Instead this
        // removes only this seller's own products from the order via
        // $pull, and only deletes the whole order document if that
        // leaves it with no products at all.
        const updated_order = await orders.findOneAndUpdate(
            {
                _id: order_id,
                "products.seller_id": seller_id
            },
            {
                $pull: { products: { seller_id: seller_id } }
            },
            { new: true }
        );

        if (!updated_order) {
            return res.status(404).json({
                success: false,
                message: "order not found",
                data:[]
            });
        }

        let response_order = updated_order;

        if (updated_order.products.length === 0) {
            response_order = await orders.findOneAndDelete({ _id: order_id });
        }

        if (req.io) {
            req.io.to("admins").emit("deleted_order", {
                deleted_order: response_order
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order deleted successfully",
            data:[]
        });
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

module.exports = DEL_order