const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const adminMiddleware =
require("../middleware/adminMiddleware");

const {
    createExam,
    getAllExams,
    getExamById,
    startExam,
    updateExam,
    deleteExam
} = require("../controllers/examController");

router.post(
    "/create",
    authMiddleware,
    adminMiddleware,
    createExam
);

router.get(
    "/list",
    getAllExams
);

router.get(
    "/start/:examId",
    startExam
);

router.get(
    "/:id",
    getExamById
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateExam
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteExam
);

module.exports = router;