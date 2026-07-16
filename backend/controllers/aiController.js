const { explainAnswer } = require("../services/aiService");

async function getExplanation(req, res) {

    try {

        const {

            question,
            options,
            correctAnswer,
            userAnswer

        } = req.body;

        if (
            !question ||
            !options ||
            !correctAnswer ||
            !userAnswer
        ) {

            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });

        }

        const explanation =
            await explainAnswer(

                question,
                options,
                correctAnswer,
                userAnswer

            );

        res.json({

            success: true,

            explanation

        });

    }

    catch (error) {

    console.error("AI ERROR:");

    console.error(error);

    res.status(500).json({

        success:false,

        message:error.message

    });

}

}

module.exports = {

    getExplanation

};