const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

/*
CREATE EXAM
*/
const createExam = async (req, res) => {

    try {

        const db = getDB();

        const {
            title,
            description,
            duration,
            totalQuestions
        } = req.body;

        const result = await db
            .collection("exams")
            .insertOne({
                title,
                description,
                duration,
                totalQuestions,
                status: "active",
                createdAt: new Date()
            });

        return res.json({
            success: true,
            examId: result.insertedId
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/*
GET ALL EXAMS
*/
const getAllExams = async (req, res) => {

    try {

        const db = getDB();

        const exams = await db
            .collection("exams")
            .find({})
            .toArray();

        return res.json({
            success: true,
            exams
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/*
GET EXAM BY ID
*/
const getExamById = async (req, res) => {

    try {

        const db = getDB();

        const exam = await db
            .collection("exams")
            .findOne({
                _id: new ObjectId(req.params.id)
            });

        return res.json({
            success: true,
            exam
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};



/*
START EXAM
*/
const startExam = async (req, res) => {

    try {

        const db = getDB();

        const examId = req.params.examId;
        const userId = req.query.userId;

        const existingResult =
            await db.collection("results")
            .findOne({
                examId,
                userId
            });

        if (existingResult) {

            return res.status(400).json({
                success: false,
                message: "You already attended this exam"
            });

        }

        const questions = await db
            .collection("questions")
            .find({
                examId
            })
            .project({
                correctAnswer: 0
            })
            .toArray();

        return res.json({
            success: true,
            questions
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/*
UPDATE EXAM
*/
const updateExam = async (req, res) => {

    try {

        const db = getDB();

        const {
            title,
            description,
            duration,
            totalQuestions,
            status
        } = req.body;

        await db.collection("exams")
            .updateOne(
                {
                    _id: new ObjectId(req.params.id)
                },
                {
                    $set: {
                        title,
                        description,
                        duration,
                        totalQuestions,
                        status
                    }
                }
            );

        return res.json({
            success: true,
            message: "Exam Updated"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/*
DELETE EXAM
*/
const deleteExam = async (req, res) => {

    try {

        const db = getDB();

        await db.collection("exams")
            .deleteOne({
                _id: new ObjectId(req.params.id)
            });

        await db.collection("questions")
            .deleteMany({
                examId: req.params.id
            });

        return res.json({
            success: true,
            message: "Exam Deleted"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    createExam,
    getAllExams,
    getExamById,
    startExam,
    updateExam,
    deleteExam
};