const { getDB } = require("../config/db");

const getAnalytics = async (req, res) => {

    try {

        const db = getDB();

        const totalUsers =
        await db.collection("users")
        .countDocuments();

        const totalExams =
        await db.collection("exams")
        .countDocuments();

        const totalQuestions =
        await db.collection("questions")
        .countDocuments();

        const totalAttempts =
        await db.collection("results")
        .countDocuments();

        const scores =
        await db.collection("results")
        .find({})
        .toArray();

        let averageScore = 0;
        let highestScore = 0;

        if (scores.length > 0) {

            const totalScore =
            scores.reduce(
                (sum, item) =>
                sum + item.score,
                0
            );

            averageScore =
            (
                totalScore /
                scores.length
            ).toFixed(2);

            highestScore =
            Math.max(
                ...scores.map(
                    s => s.score
                )
            );

        }

        const recentResults =
        await db.collection("results")
        .aggregate([

            {
                $addFields: {

                    userObjectId: {
                        $toObjectId: "$userId"
                    },

                    examObjectId: {
                        $toObjectId: "$examId"
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
                $lookup: {
                    from: "exams",
                    localField: "examObjectId",
                    foreignField: "_id",
                    as: "exam"
                }
            },

            {
                $project: {

                    email: {
                        $arrayElemAt: [
                            "$user.email",
                            0
                        ]
                    },

                    examTitle: {
                        $arrayElemAt: [
                            "$exam.title",
                            0
                        ]
                    },

                    score: 1,

                    percentage: 1,

                    submittedAt: 1
                }
            },

            {
                $sort: {
                    submittedAt: -1
                }
            },

            {
                $limit: 10
            }

        ])
        .toArray();

        return res.json({

            success: true,

            totalUsers,

            totalExams,

            totalQuestions,

            totalAttempts,

            averageScore,

            highestScore,

            recentResults

        });

    }
    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {
    getAnalytics
};