const express =
require("express");

const router =
express.Router();

const {
    getAnalytics
} = require(
    "../controllers/analyticsController"
);

router.get(
    "/dashboard",
    getAnalytics
);

module.exports = router;