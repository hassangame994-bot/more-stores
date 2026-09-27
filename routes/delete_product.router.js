const express = require("express");

const router = express.Router();

const delete_product = require("../controller/delete_product.controller");

const auth_seller = require("../middleware/auth_seller")

router.delete("/api/seller/delete_product",auth_seller,delete_product)

module.exports = router