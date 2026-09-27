const express = require("express");

const router = express.Router();

const add_product = require("../controller/add_products.controller");

const auth_seller = require("../middleware/auth_seller")

router.post("/api/seller/add_product",auth_seller,add_product)

module.exports = router