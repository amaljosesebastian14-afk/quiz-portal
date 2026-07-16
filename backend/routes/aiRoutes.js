const express = require("express");

const router = express.Router();

const {
    getExplanation
} = require("../controllers/aiController");

router.post(
    "/explain",
    getExplanation
);

module.exports = router;