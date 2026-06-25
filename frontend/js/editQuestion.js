const questionId =
localStorage.getItem(
    "questionId"
);

loadQuestion();

async function loadQuestion(){

    const response =
    await fetch(
        `http://localhost:5000/api/question/${questionId}`
    );

    const data =
    await response.json();

    const q =
    data.question;

    document.getElementById(
        "question"
    ).value =
    q.question;

    document.getElementById(
        "option1"
    ).value =
    q.options[0];

    document.getElementById(
        "option2"
    ).value =
    q.options[1];

    document.getElementById(
        "option3"
    ).value =
    q.options[2];

    document.getElementById(
        "option4"
    ).value =
    q.options[3];

    document.getElementById(
        "correctAnswer"
    ).value =
    q.correctAnswer;
}

async function updateQuestion(){

    const response =
    await fetch(
        `http://localhost:5000/api/question/${questionId}`,
        {
            method:"PUT",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                question:
                document.getElementById(
                    "question"
                ).value,

                options:[
                    document.getElementById(
                        "option1"
                    ).value,

                    document.getElementById(
                        "option2"
                    ).value,

                    document.getElementById(
                        "option3"
                    ).value,

                    document.getElementById(
                        "option4"
                    ).value
                ],

                correctAnswer:
                Number(
                    document.getElementById(
                        "correctAnswer"
                    ).value
                )

            })

        }
    );

    const data =
    await response.json();

    alert(
        data.message
    );

    window.location =
    "view-questions.html";
}