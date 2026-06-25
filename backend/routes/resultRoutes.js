const express = require("express");

const router = express.Router();

const {
    submitExam, getUserResults, getLeaderboard
} = require("../controllers/resultController");

router.post(
    "/submit",
    submitExam
);

router.get(
    "/user/:userId",
    getUserResults
);

router.get(
    "/leaderboard/:examId",
    getLeaderboard
);

module.exports = router;