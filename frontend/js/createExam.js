document.querySelectorAll(
    "input, textarea"
).forEach(element => {

    element.addEventListener(
        "input",
        updatePreview
    );

});

function updatePreview() {

    document.getElementById(
        "previewTitle"
    ).innerText =
    document.getElementById(
        "title"
    ).value || "-";

    document.getElementById(
        "previewDescription"
    ).innerText =
    document.getElementById(
        "description"
    ).value || "-";

    document.getElementById(
        "previewDuration"
    ).innerText =
    document.getElementById(
        "duration"
    ).value || 0;

    document.getElementById(
        "previewQuestions"
    ).innerText =
    document.getElementById(
        "totalQuestions"
    ).value || 0;
}

async function createExam() {

    const title =
    document.getElementById(
        "title"
    ).value;

    const description =
    document.getElementById(
        "description"
    ).value;

    const duration =
    Number(
        document.getElementById(
            "duration"
        ).value
    );

    const totalQuestions =
    Number(
        document.getElementById(
            "totalQuestions"
        ).value
    );

    if (
        !title ||
        !description ||
        !duration ||
        !totalQuestions
    ) {

        alert(
            "Please fill all fields"
        );

        return;
    }

    const token =
    localStorage.getItem(
        "firebaseToken"
    );

    if (!token) {

        alert(
            "Please login again"
        );

        window.location =
        "login.html";

        return;
    }

    try {

        const response =
        await fetch(
            "https://quiz-portal-1lia.onrender.com/api/exam/create",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json",

                    "Authorization":
                    `Bearer ${token}`
                },

                body: JSON.stringify({

                    title,
                    description,
                    duration,
                    totalQuestions

                })

            }
        );

        const data =
        await response.json();

        if (data.success) {

            alert(
                "Exam Created Successfully"
            );

            window.location =
            "manage-exams.html";

        } else {

            alert(
                data.message
            );

        }

    } catch (error) {

        alert(
            error.message
        );

    }

}