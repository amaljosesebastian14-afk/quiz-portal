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

function languageName(lang) {

    if (lang === "ml") {
        return "Malayalam";
    }

    return "English";

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
lang: "en" or "ml" - the language the explanation itself should be written in
*/
async function explainWrongAnswers(wrongQuestions, lang = "en") {

    if (!wrongQuestions.length) {
        return [];
    }

    const targetLanguage = languageName(lang);

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

IMPORTANT: Write the "explanation", "example", and "tip" fields
entirely in ${targetLanguage}. Keep "question", "correctAnswer",
and "userAnswer" exactly as given (do not translate those).

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
                            `You are a friendly programming tutor. Always return valid JSON only. Write explanations in ${targetLanguage}.`
                    },

                    {
                        role: "user",
                        content: prompt
                    }

                ],

                temperature: 0.2,

                max_completion_tokens: 1500

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

/*
Translate a single small batch (max ~5 questions) in one Groq call.
Keeping batches small avoids hitting the output token limit, which
was previously truncating responses and breaking JSON parsing.
*/
async function translateQuestionBatch(questions, lang) {

    const targetLanguage = languageName(lang);

    let prompt = `
Translate the following quiz questions and their multiple-choice
options into ${targetLanguage}. Keep the meaning, tone, and difficulty
exactly the same - this is a direct translation, not a rewrite.
Do not translate proper nouns, brand names, or numbers unless they
have a standard translated form.

CRITICAL RULES:
1. Return ONLY a JSON array, one object per question, in the SAME ORDER as given.
2. The JSON KEYS must stay EXACTLY "question" and "options" IN ENGLISH -
   do NOT translate the keys, only translate the text VALUES.
3. Do not add any extra keys, comments, or text outside the JSON array.

Exact shape required (keys must match this precisely):

[
  {
    "question": "<translated question text here>",
    "options": ["<translated option 1>", "<translated option 2>", "<translated option 3>", "<translated option 4>"]
  }
]

Questions to translate:

`;

    questions.forEach((q, index) => {

        prompt += `
Question ${index + 1}:
${q.question}

Options:
${q.options.join("\n")}

`;

    });

    const response =
        await groq.chat.completions.create({

            model: "llama-3.1-8b-instant",

            messages: [

                {
                    role: "system",
                    content:
                        `You are a precise translator. Always return valid JSON only, with keys exactly "question" and "options" in English, and values in ${targetLanguage}.`
                },

                {
                    role: "user",
                    content: prompt
                }

            ],

            temperature: 0.1,

            max_completion_tokens: 2000

        });

    const content =
        response.choices[0].message.content;

    let translated;

    try {

        translated = JSON.parse(extractJSON(content));

    }
    catch (parseError) {

        console.error(
            "TRANSLATION JSON PARSE ERROR. Raw content was:",
            content
        );

        throw new Error(
            "Translation returned an unexpected format."
        );

    }

    return questions.map((q, index) => ({

        questionId: q.questionId,

        question:
            translated[index]?.question || q.question,

        options:
            translated[index]?.options || q.options

    }));

}

/*
Batch-translate quiz questions + their options into the target language.
Splits into small chunks (max 5 questions per Groq call) so responses
never get long enough to hit the output token limit and truncate.
Input: [{ questionId, question, options: [...] }, ...]
Output: [{ questionId, question, options: [...] }, ...] translated
*/
async function translateQuestions(questions, lang) {

    if (!questions.length) {
        return [];
    }

    const CHUNK_SIZE = 5;

    const chunks = [];

    for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
        chunks.push(questions.slice(i, i + CHUNK_SIZE));
    }

    try {

        const results = [];

        for (const chunk of chunks) {

            const translatedChunk =
                await translateQuestionBatch(chunk, lang);

            results.push(...translatedChunk);

        }

        return results;

    }
    catch (error) {

        console.error("TRANSLATION ERROR:", error);

        throw new Error(
            error.error?.message ||
            error.message ||
            "Failed to translate questions."
        );

    }

}

module.exports = {
    explainAnswer,
    explainWrongAnswers,
    translateQuestions
};