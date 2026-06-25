loadExams();

async function loadExams(){

    const response =
    await fetch(
        "http://localhost:5000/api/exam/list"
    );

    const data =
    await response.json();

    let html = "";

    data.exams.forEach(exam=>{

        html += `

        <div class="card">

            <h2>
                ${exam.title}
            </h2>

            <p>
                ${exam.description}
            </p>

            <p>
                ⏱ Duration:
                ${exam.duration} Minutes
            </p>

            <p>
                ❓ Questions:
                ${exam.totalQuestions}
            </p>

            <button
                onclick="startExam(
                '${exam._id}'
                )">

                Start Exam

            </button>

        </div>

        `;
    });

    document
    .getElementById(
        "examContainer"
    )
    .innerHTML = html;
}

function startExam(id){

    localStorage.setItem(
        "examId",
        id
    );

    window.location =
    "exam.html";
}