const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

/*
SUBMIT EXAM
*/
const submitExam = async (req, res) => {

    try {

        const db = getDB();

        const {
            examId,
            userId,
            answers
        } = req.body;

        let score = 0;

        for (const answer of answers) {

            const question =
            await db.collection("questions")
            .findOne({
                _id: new ObjectId(
                    answer.questionId
                )
            });

            if (
                question &&
                question.correctAnswer ===
                answer.selectedAnswer
            ) {
                score++;
            }

        }

        const examQuestions =
        await db.collection("questions")
        .find({
            examId
        })
        .toArray();

        const totalQuestions =
        examQuestions.length;

        const percentage =
        totalQuestions > 0
        ? Number(
            (
                (score / totalQuestions) * 100
            ).toFixed(2)
        )
        : 0;

        await db.collection("results")
        .insertOne({

            examId,

            userId,

            score,

            totalQuestions,

            percentage,

            submittedAt:
            new Date()

        });

        return res.json({

            success: true,

            score,

            totalQuestions,

            percentage

        });

    }
    catch(error){

        return res.status(500)
        .json({

            success: false,

            message: error.message

        });

    }

};

/*
USER RESULTS
*/
const getUserResults = async (req, res) => {

    try {

        const db = getDB();

        const results = await db
        .collection("results")
        .aggregate([

            {
                $match: {
                    userId: req.params.userId
                }
            },

            {
                $addFields: {
                    examObjectId: {
                        $toObjectId: "$examId"
                    }
                }
            },

            {
                $lookup: {
                    from: "exams",
                    localField: "examObjectId",
                    foreignField: "_id",
                    as: "exam"
                }
            },

            {
                $project: {

                    score: 1,

                    totalQuestions: 1,

                    percentage: 1,

                    submittedAt: 1,

                    examTitle: {
                        $arrayElemAt: [
                            "$exam.title",
                            0
                        ]
                    }
                }
            },

            {
                $sort: {
                    submittedAt: -1
                }
            }

        ])
        .toArray();

        res.json({
            success: true,
            results
        });

    }
    catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

/*
LEADERBOARD
*/
const getLeaderboard = async (req, res) => {

    try {

        const db = getDB();

        const examId =
        req.params.examId;

        const leaderboard =
        await db.collection("results")
        .aggregate([

            {
                $match: {
                    examId
                }
            },

            {
                $addFields: {
                    userObjectId: {
                        $toObjectId: "$userId"
                    }
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "userObjectId",
                    foreignField: "_id",
                    as: "user"
                }
            },

            {
                $unwind: "$user"
            },

            {
                $project: {

                    name: "$user.name",

                    email: "$user.email",

                    score: 1,

                    percentage: 1

                }
            },

            {
                $sort: {
                    score: -1
                }
            },

            {
                $limit: 10
            }

        ])
        .toArray();

        return res.json({

            success: true,

            leaderboard

        });

    }
    catch(error){

        return res.status(500)
        .json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    submitExam,

    getUserResults,

    getLeaderboard

};