const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const adminMiddleware =
require("../middleware/adminMiddleware");

const {
    addQuestion,
    getQuestionsByExam,
    updateQuestion,
    deleteQuestion,
    getQuestionById
} = require("../controllers/questionController");

router.post(
    "/add",
    authMiddleware,
    adminMiddleware,
    addQuestion
);

router.get(
    "/exam/:examId",
    getQuestionsByExam
);

router.get(
    "/:id",
    getQuestionById
);

router.put(
    "/:id",
    updateQuestion
);

router.delete(
    "/:id",
    deleteQuestion
);

module.exports = router;