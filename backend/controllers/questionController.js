const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

/*
ADD QUESTION
*/
const addQuestion = async (req, res) => {

    try {

        const db = getDB();

        const {
            examId,
            question,
            options,
            correctAnswer
        } = req.body;

        const result = await db
            .collection("questions")
            .insertOne({
                examId,
                question,
                options,
                correctAnswer,
                createdAt: new Date()
            });

        return res.json({
            success: true,
            questionId: result.insertedId
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/*
GET QUESTIONS BY EXAM
*/
const getQuestionsByExam = async (req, res) => {

    try {

        const db = getDB();

        const questions = await db
            .collection("questions")
            .find({
                examId: req.params.examId
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
UPDATE QUESTION
*/
const updateQuestion = async (req, res) => {

    try {

        const db = getDB();

        const {
            question,
            options,
            correctAnswer
        } = req.body;

        await db.collection("questions")
            .updateOne(
                {
                    _id: new ObjectId(req.params.id)
                },
                {
                    $set: {
                        question,
                        options,
                        correctAnswer
                    }
                }
            );

        return res.json({
            success: true,
            message: "Question Updated"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

/*
DELETE QUESTION
*/
const deleteQuestion = async (req, res) => {

    try {

        const db = getDB();

        await db.collection("questions")
            .deleteOne({
                _id: new ObjectId(req.params.id)
            });

        return res.json({
            success: true,
            message: "Question Deleted"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const getQuestionById = async (req, res) => {

    try {

        const db = getDB();

        const question =
        await db.collection("questions")
        .findOne({
            _id: new ObjectId(
                req.params.id
            )
        });

        return res.json({
            success: true,
            question
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    addQuestion,
    getQuestionsByExam,
    updateQuestion,
    deleteQuestion,
    getQuestionById
};