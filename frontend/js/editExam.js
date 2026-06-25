const examId =
localStorage.getItem(
    "examId"
);

loadExam();

async function loadExam(){

    const response =
    await fetch(
        `https://quiz-portal-1lia.onrender.com/api/exam/${examId}`
    );

    const data =
    await response.json();

    const exam =
    data.exam;

    document.getElementById(
        "title"
    ).value =
    exam.title;

    document.getElementById(
        "description"
    ).value =
    exam.description;

    document.getElementById(
        "duration"
    ).value =
    exam.duration;

    document.getElementById(
        "totalQuestions"
    ).value =
    exam.totalQuestions;

    document.getElementById(
        "status"
    ).value =
    exam.status;
}

async function updateExam(){

    const token =
    localStorage.getItem(
        "firebaseToken"
    );

    const response =
    await fetch(
        `https://quiz-portal-1lia.onrender.com/api/exam/${examId}`,
        {
            method:"PUT",

            headers:{
                "Content-Type":
                "application/json",

                "Authorization":
                `Bearer ${token}`
            },

            body:JSON.stringify({

                title:
                document.getElementById(
                    "title"
                ).value,

                description:
                document.getElementById(
                    "description"
                ).value,

                duration:
                Number(
                    document.getElementById(
                        "duration"
                    ).value
                ),

                totalQuestions:
                Number(
                    document.getElementById(
                        "totalQuestions"
                    ).value
                ),

                status:
                document.getElementById(
                    "status"
                ).value

            })

        }
    );

    const data =
    await response.json();

    alert(
        data.message
    );

    window.location =
    "manage-exams.html";
}