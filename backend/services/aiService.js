const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY.trim()
});

/*
Strip markdown code fences that LLMs sometimes wrap JSON in,
even when explicitly told to return raw JSON only.
*/
function extractJSON(content) {

    let cleaned = content.trim();

    if (cleaned.startsWith("```")) {

        cleaned = cleaned
            .replace(/^```(json)?/i, "")
            .replace(/```$/, "")
            .trim();

    }

    return cleaned;

}

/*
Single question explanation (used by aiController.js's on-demand endpoint)
*/
async function explainAnswer(question, options, correctAnswer, userAnswer) {

    const prompt = `
You are an expert programming tutor.

Question:
${question}

Options:
${options.join("\n")}

Correct Answer:
${correctAnswer}

Student Answer:
${userAnswer}

Explain:
1. Why the correct answer is correct.
2. Why the student's answer is wrong.
3. Give one simple example.

Keep the explanation under 100 words.
`;

    const response = await groq.chat.completions.create({

        model: "llama-3.1-8b-instant",

        messages: [
            {
                role: "user",
                content: prompt
            }
        ],

        temperature: 0.3,

        max_completion_tokens: 150

    });

    return response.choices[0].message.content;

}

/*
Batch explanation for all wrong answers on exam submission
(single API call instead of one per question, avoids rate-limit issues)
*/
async function explainWrongAnswers(wrongQuestions) {

    if (!wrongQuestions.length) {
        return [];
    }

    let prompt = `
You are an expert programming tutor.

You will receive multiple incorrectly answered quiz questions.

For EACH question, provide:

1. Question
2. Correct Answer
3. Why the correct answer is correct
4. Why the student's answer is wrong
5. One simple example
6. One learning tip

Return ONLY a JSON array.

Example format:

[
  {
    "question":"...",
    "correctAnswer":"...",
    "userAnswer":"...",
    "explanation":"...",
    "example":"...",
    "tip":"..."
  }
]

Questions:

`;

    wrongQuestions.forEach((q, index) => {

        prompt += `
Question ${index + 1}

Question:
${q.question}

Options:
${q.options.join("\n")}

Correct Answer:
${q.correctAnswer}

Student Answer:
${q.userAnswer}

`;

    });

    try {

        const response =
            await groq.chat.completions.create({

                model: "llama-3.1-8b-instant",

                messages: [

                    {
                        role: "system",
                        content:
                            "You are a friendly programming tutor. Always return valid JSON only."
                    },

                    {
                        role: "user",
                        content: prompt
                    }

                ],

                temperature: 0.2,

                max_completion_tokens: 1000

            });

        const content =
            response.choices[0].message.content;

        try {

            return JSON.parse(extractJSON(content));

        }
        catch (parseError) {

            console.error(
                "AI JSON PARSE ERROR. Raw content was:",
                content
            );

            throw new Error(
                "AI returned an unexpected format. Please try again."
            );

        }

    }
    catch (error) {

        console.error("AI ERROR:", error);

        throw new Error(
            error.error?.message ||
            error.message ||
            "Failed to generate AI explanations."
        );

    }

}

module.exports = {
    explainAnswer,
    explainWrongAnswers
};