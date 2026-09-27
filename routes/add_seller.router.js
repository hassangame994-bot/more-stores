const express = require("express");

const router = express.Router();

const add_seller = require("../controller/add_seller.controller");


const auth = require("../middleware/auth");

router.put("/api/request_seller_promotion", auth, add_seller);

module.exports = router