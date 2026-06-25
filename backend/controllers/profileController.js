const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const getProfile = async (req, res) => {

    try {

        const db = getDB();

        const userId =
        req.params.userId;

        const user =
        await db.collection("users")
        .findOne({
            _id: new ObjectId(userId)
        });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        const results =
        await db.collection("results")
        .find({
            userId
        })
        .toArray();

        const attempts =
        results.length;

        let highestScore = 0;
        let averageScore = 0;

        if (attempts > 0) {

            highestScore =
            Math.max(
                ...results.map(
                    r => r.score
                )
            );

            const totalScore =
            results.reduce(
                (sum, r) =>
                sum + r.percentage,
                0
            );

            averageScore =
            (
                totalScore /
                attempts
            ).toFixed(2);

        }

        return res.json({

            success: true,

            profile: {

                name: user.name,

                email: user.email,

                role: user.role,

                attempts,

                highestScore,

                averageScore

            }

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
    getProfile
};