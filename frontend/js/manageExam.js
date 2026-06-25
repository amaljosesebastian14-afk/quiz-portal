loadExams();

async function loadExams() {

    const token =
    localStorage.getItem(
        "firebaseToken"
    );

    const response =
    await fetch(
        "http://localhost:5000/api/exam/list",
        {
            headers:{
                "Authorization":
                `Bearer ${token}`
            }
        }
    );

    const data =
    await response.json();

    let html = "";

    data.exams.forEach(exam => {

        html += `

        <tr>

            <td>
                ${exam.title}
            </td>

            <td>
                ${exam.duration} Min
            </td>

            <td>
                ${exam.totalQuestions}
            </td>

            <td>
                ${exam.status}
            </td>

            <td>

                <button
                    onclick="editExam(
                    '${exam._id}'
                    )"
                >
                    Edit
                </button>

                <button
                    class="btn-danger"
                    onclick="deleteExam(
                    '${exam._id}'
                    )"
                >
                    Delete
                </button>

                <button
                    class="btn-success"
                    onclick="viewQuestions(
                    '${exam._id}'
                    )"
                >
                    Questions
                </button>

            </td>

        </tr>

        `;
    });

    document
    .getElementById(
        "examContainer"
    )
    .innerHTML = html;
}

function editExam(id) {

    localStorage.setItem(
        "examId",
        id
    );

    window.location =
    "edit-exam.html";
}

async function deleteExam(id) {

    const confirmDelete =
    confirm(
        "Delete this exam?"
    );

    if (!confirmDelete) {
        return;
    }

    const token =
    localStorage.getItem(
        "firebaseToken"
    );

    await fetch(
        `https://quiz-portal-1lia.onrender.com/api/exam/${id}`,
        {
            method: "DELETE",

            headers:{
                "Authorization":
                `Bearer ${token}`
            }
        }
    );

    loadExams();
}

function viewQuestions(id) {

    localStorage.setItem(
        "examId",
        id
    );

    window.location =
    "view-questions.html";
}