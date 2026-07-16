const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { explainWrongAnswers } = require("../services/aiService");

/*
Fetch cached explanations where available, and only call the AI
for wrong-answer combinations that have never been explained before.
Cache key = questionId + selectedAnswer (the specific wrong option chosen).
*/
async function getExplanationsWithCache(db, wrongAnswers) {

    const cacheCollection =
        db.collection("aiExplanations");

    if (wrongAnswers.length === 0) {
        return [];
    }

    /*
    1. Look up existing cached explanations for every
    (questionId, selectedAnswer) pair in this submission
    */
    const cachedDocs =
        await cacheCollection.find({
            $or: wrongAnswers.map(wa => ({
                questionId: wa.questionId,
                selectedAnswer: wa.selectedAnswer
            }))
        }).toArray();

    const cacheMap = new Map();

    cachedDocs.forEach(doc => {

        cacheMap.set(
            `${doc.questionId}|${doc.selectedAnswer}`,
            doc
        );

    });

    /*
    2. Figure out which wrong answers still need
    a fresh AI explanation
    */
    const uncached =
        wrongAnswers.filter(wa =>
            !cacheMap.has(
                `${wa.questionId}|${wa.selectedAnswer}`
            )
        );

    /*
    3. Call the AI only for the uncached ones, in a single batched call
    */
    if (uncached.length > 0) {

        const freshExplanations =
            await explainWrongAnswers(uncached);

        const docsToCache =
            uncached.map((wa, i) => ({

                questionId: wa.questionId,

                selectedAnswer: wa.selectedAnswer,

                question: wa.question,

                correctAnswer: wa.correctAnswer,

                userAnswer: wa.userAnswer,

                explanation:
                    freshExplanations[i]?.explanation || "",

                example:
                    freshExplanations[i]?.example || "",

                tip:
                    freshExplanations[i]?.tip || "",

                createdAt: new Date()

            }));

        /*
        4. Store each new explanation for future reuse.
        Uses upsert with $setOnInsert so if two users trigger
        the same never-seen-before wrong answer at the same time,
        the second write just no-ops instead of erroring/duplicating.
        (Recommended: create a unique index once on
        { questionId: 1, selectedAnswer: 1 } in this collection.)
        */
        await Promise.all(

            docsToCache.map(doc =>

                cacheCollection.updateOne(

                    {
                        questionId: doc.questionId,
                        selectedAnswer: doc.selectedAnswer
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

            cacheMap.set(
                `${doc.questionId}|${doc.selectedAnswer}`,
                doc
            );

        });

    }

    /*
    5. Build the final explanations array, in the SAME order
    as the original wrongAnswers list, mixing cached + fresh
    */
    return wrongAnswers.map(wa => {

        const doc =
            cacheMap.get(
                `${wa.questionId}|${wa.selectedAnswer}`
            );

        return {

            question: wa.question,

            correctAnswer: wa.correctAnswer,

            userAnswer: wa.userAnswer,

            explanation: doc?.explanation || "",

            example: doc?.example || "",

            tip: doc?.tip || ""

        };

    });

}

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

        let wrongAnswers = [];

        for (const answer of answers) {

            const question =
                await db.collection("questions")
                .findOne({
                    _id: new ObjectId(answer.questionId)
                });

            if (!question) continue;

            if (question.correctAnswer === answer.selectedAnswer) {

                score++;

            } else {

                wrongAnswers.push({

                    questionId: answer.questionId,

                    selectedAnswer: answer.selectedAnswer,

                    question: question.question,

                    options: question.options,

                    correctAnswer:
                        question.options[question.correctAnswer],

                    userAnswer:
                        question.options[answer.selectedAnswer]

                });

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

        let explanations = [];

        if (wrongAnswers.length > 0) {

            try {

                explanations =
                    await getExplanationsWithCache(
                        db,
                        wrongAnswers
                    );

            }
            catch (aiError) {

                console.error(
                    "AI EXPLANATION FAILED (submission still proceeds):",
                    aiError
                );

                explanations = [];

            }

        }

        await db.collection("results")
            .insertOne({

                examId,

                userId,

                score,

                totalQuestions,

                percentage,

                submittedAt: new Date()

            });

        return res.json({

            success: true,

            score,

            totalQuestions,

            percentage,

            explanations

        });

    }
    catch (error) {

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