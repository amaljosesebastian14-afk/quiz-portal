const result =
JSON.parse(
    localStorage.getItem("result")
);

document
.getElementById("score")
.innerText =
`${result.score}/${result.totalQuestions}`;

document
.getElementById("percentage")
.innerText =
`${result.percentage}%`;

let performance = "";

if(result.percentage >= 80){

    performance =
    "🏆 Excellent Performance";

}
else if(result.percentage >= 60){

    performance =
    "✅ Good Performance";

}
else{

    performance =
    "📚 Keep Practicing";
}

document
.getElementById("performance")
.innerHTML =
`<h2>${performance}</h2>`;

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