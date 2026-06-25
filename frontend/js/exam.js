const examId = localStorage.getItem("examId");

let questions = [];
let timerInterval;
let timeLeft = 600;

loadQuestions();

async function loadQuestions() {


try {

    const user =
    JSON.parse(
        localStorage.getItem("user")
    );

    const response =
    await fetch(
        `http://localhost:5000/api/exam/start/${examId}?userId=${user._id}`
    );

    const data =
    await response.json();

    if (!data.success) {

        alert(data.message);

        window.location =
        "dashboard.html";

        return;
    }

    questions = data.questions;

    renderQuestions();

    startTimer();

    updateProgress();

}
catch(error){

    console.error(error);

    alert("Failed to load exam");

}


}

function renderQuestions(){


let html = "";

questions.forEach((q,index)=>{

    html += `

    <div class="question-card">

        <div class="question-title">

            Question ${index + 1}

        </div>

        <h3>

            ${q.question}

        </h3>

        <div class="options">

            ${q.options.map((option,i)=>`

                <label class="option">

                    <input
                        type="radio"
                        name="${q._id}"
                        value="${i}"
                        onchange="updateProgress()"
                    >

                    <span>

                        ${option}

                    </span>

                </label>

            `).join("")}

        </div>

    </div>

    `;

});

document.getElementById(
    "examForm"
).innerHTML = html;


}

function updateProgress(){


const answered =
document.querySelectorAll(
    'input[type="radio"]:checked'
).length;

const percent =
(answered / questions.length) * 100;

document.getElementById(
    "progressBar"
).style.width =
percent + "%";


}

function startTimer(){


timerInterval =
setInterval(()=>{

    timeLeft--;

    const minutes =
    Math.floor(timeLeft / 60);

    const seconds =
    timeLeft % 60;

    document.getElementById(
        "timer"
    ).innerText =
    `${minutes}:${seconds
        .toString()
        .padStart(2,"0")}`;

    const timerBox =
    document.querySelector(
        ".timer-box"
    );

    if(timeLeft <= 300){

        timerBox.style.background =
        "#f59e0b";

    }

    if(timeLeft <= 60){

        timerBox.style.background =
        "#dc2626";

    }

    if(timeLeft === 60){

        alert(
            "Only 1 minute remaining!"
        );

    }

    if(timeLeft <= 0){

        clearInterval(
            timerInterval
        );

        alert(
            "Time is up! Exam submitted automatically."
        );

        submitExam();

    }

},1000);


}

async function submitExam(){


const confirmSubmit =
confirm(
    "Are you sure you want to submit the exam?"
);

if(!confirmSubmit){
    return;
}

clearInterval(
    timerInterval
);

const user =
JSON.parse(
    localStorage.getItem("user")
);

const answers = [];

questions.forEach(q=>{

    const selected =
    document.querySelector(
        `input[name="${q._id}"]:checked`
    );

    if(selected){

        answers.push({

            questionId:
            q._id,

            selectedAnswer:
            Number(
                selected.value
            )

        });

    }

});

try{

    const response =
    await fetch(
        "http://localhost:5000/api/result/submit",
        {
            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

                examId,

                userId:user._id,

                answers

            })

        }
    );

    const result =
    await response.json();

    localStorage.setItem(
        "result",
        JSON.stringify(result)
    );

    window.location =
    "result.html";

}
catch(error){

    console.error(error);

    alert(
        "Failed to submit exam"
    );

}


}
