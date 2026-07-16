const result = JSON.parse(
    localStorage.getItem("result")
);

if (!result) {

    alert(
        "No result found. Please take an exam first."
    );

    window.location =
    "dashboard.html";

}
else {

    // Score
    document.getElementById("score").innerText =
    `${result.score}/${result.totalQuestions}`;

    // Percentage
    document.getElementById("percentage").innerText =
    `${result.percentage}%`;

    // Performance
    let performance = "";

    if(result.percentage >= 80){

        performance = "🏆 Excellent Performance";

    }
    else if(result.percentage >= 60){

        performance = "✅ Good Performance";

    }
    else{

        performance = "📚 Keep Practicing";

    }

    document.getElementById("performance").innerHTML =
    `<h2>${performance}</h2>`;


    /*
    ==========================
    AI EXPLANATIONS
    ==========================
    */

    if(
        result.explanations &&
        result.explanations.length > 0
    ){

        document.getElementById("aiSection").style.display = "block";

        let html = "";

        result.explanations.forEach((item,index)=>{

            html += `

            <div class="ai-explanation-card">

                <div class="ai-question">
                    ❌ Question ${index+1}: ${item.question}
                </div>

                <div class="ai-answer-row wrong">
                    <span class="label">Your Answer:</span>
                    <span class="value">${item.userAnswer}</span>
                </div>

                <div class="ai-answer-row correct">
                    <span class="label">Correct Answer:</span>
                    <span class="value">${item.correctAnswer}</span>
                </div>

                ${
                    item.explanation
                    ? `<div class="ai-explanation-text">${item.explanation}</div>`
                    : ""
                }

                ${
                    item.example
                    ? `<div class="ai-explanation-text"><strong>Example:</strong> ${item.example}</div>`
                    : ""
                }

                ${
                    item.tip
                    ? `<div class="ai-tip">💡 ${item.tip}</div>`
                    : ""
                }

            </div>

            `;

        });

        document.getElementById("aiContent").innerHTML =
        html;

    }

}


/*
==========================
BUTTONS
==========================
*/

function goLeaderboard(){

    window.location =
    "leaderboard.html";

}

function goHistory(){

    window.location =
    "history.html";

}

function goDashboard(){

    window.location =
    "dashboard.html";

}