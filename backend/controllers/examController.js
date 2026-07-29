const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { translateQuestions } = require("../services/aiService");

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
Fetch cached translations where available, and only call the AI
to translate questions that have never been translated before
into this language. Cache key = questionId + lang.
*/
async function getTranslatedQuestions(db, questions, lang) {

    if (lang === "en" || !questions.length) {
        return questions;
    }

    const cacheCollection =
        db.collection("questionTranslations");

    const questionIds =
        questions.map(q => q._id.toString());

    const cachedDocs =
        await cacheCollection.find({
            questionId: { $in: questionIds },
            lang
        }).toArray();

    const cacheMap = new Map();

    cachedDocs.forEach(doc => {
        cacheMap.set(doc.questionId, doc);
    });

    const uncached =
        questions.filter(q =>
            !cacheMap.has(q._id.toString())
        );

    if (uncached.length > 0) {

        const toTranslate =
            uncached.map(q => ({
                questionId: q._id.toString(),
                question: q.question,
                options: q.options
            }));

        try {

            const translated =
                await translateQuestions(toTranslate, lang);

            const docsToCache =
                translated.map(t => ({
                    questionId: t.questionId,
                    lang,
                    question: t.question,
                    options: t.options,
                    createdAt: new Date()
                }));

            await Promise.all(

                docsToCache.map(doc =>

                    cacheCollection.updateOne(

                        {
                            questionId: doc.questionId,
                            lang: doc.lang
                        },

                        {
                            $setOnInsert: doc
                        },

                        {
                            upsert: true
                        }

                    )

                )

            );

            docsToCache.forEach(doc => {
                cacheMap.set(doc.questionId, doc);
            });

        }
        catch (translationError) {

            console.error(
                "QUESTION TRANSLATION FAILED (falling back to original language):",
                translationError
            );

            // fall through - questions without a cached translation
            // will just render in their original language below

        }

    }

    // Build final array, translated where available, original otherwise
    return questions.map(q => {

        const doc = cacheMap.get(q._id.toString());

        return {
            ...q,
            question: doc?.question || q.question,
            options: doc?.options || q.options
        };

    });

}

/*
START EXAM
*/
const startExam = async (req, res) => {

    try {

        const db = getDB();

        const examId = req.params.examId;
        const userId = req.query.userId;
        const lang = req.query.lang === "ml" ? "ml" : "en";

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

        const localizedQuestions =
            await getTranslatedQuestions(db, questions, lang);

        return res.json({
            success: true,
            questions: localizedQuestions
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