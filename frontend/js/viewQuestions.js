const examId =
localStorage.getItem(
    "examId"
);

loadQuestions();

async function loadQuestions(){

    try{

        const response =
        await fetch(
            `http://localhost:5000/api/question/exam/${examId}`
        );

        const data =
        await response.json();

        let html = "";

        data.questions.forEach(q => {

            html += `

            <tr>

                <td>
                    ${q.question}
                </td>

                <td>

                    <ul class="option-list">

                        <li>${q.options[0]}</li>
                        <li>${q.options[1]}</li>
                        <li>${q.options[2]}</li>
                        <li>${q.options[3]}</li>

                    </ul>

                </td>

                <td>

                    <div class="action-btns">

                        <button
                        class="btn-edit"
                        onclick="editQuestion('${q._id}')">
                        Edit
                        </button>

                        <button
                        class="btn-delete"
                        onclick="deleteQuestion('${q._id}')">
                        Delete
                        </button>

                    </div>

                </td>

            </tr>

            `;

        });

        document
        .getElementById(
            "questionContainer"
        )
        .innerHTML = html;

    }
    catch(error){

        console.log(error);

        alert(
            "Failed to load questions"
        );

    }

}

function editQuestion(id){

    localStorage.setItem(
        "questionId",
        id
    );

    window.location =
    "edit-question.html";

}

async function deleteQuestion(id){

    const confirmDelete =
    confirm(
        "Are you sure you want to delete this question?"
    );

    if(!confirmDelete){
        return;
    }

    try{

        const response =
        await fetch(
            `https://quiz-portal-1lia.onrender.com/api/question/${id}`,
            {
                method:"DELETE"
            }
        );

        const data =
        await response.json();

        alert(
            data.message
        );

        loadQuestions();

    }
    catch(error){

        console.log(error);

        alert(
            "Delete failed"
        );

    }

}