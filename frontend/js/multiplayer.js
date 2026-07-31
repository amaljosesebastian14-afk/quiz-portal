const SOCKET_URL = "https://quiz-portal-1lia.onrender.com";

const socket = io(SOCKET_URL, {
    timeout: 30000
});

const user =
JSON.parse(
    localStorage.getItem("user")
);

let currentRoom = null;
let actionInProgress = false;
let hasAnsweredCurrent = false;
let clientTimerInterval = null;
let isSpectatorThisGame = false;

/*
==========================
CONNECTION STATUS
==========================
*/
socket.on("connect", () => {

    const statusEl = document.getElementById("connectionStatus");

    if (statusEl) {
        statusEl.innerText = "✅ Connected";
        statusEl.style.color = "var(--success)";

        setTimeout(() => {
            statusEl.style.display = "none";
        }, 1500);
    }

});

socket.on("connect_error", (err) => {

    const statusEl = document.getElementById("connectionStatus");

    if (statusEl) {
        statusEl.style.display = "block";
        statusEl.innerText =
            "⚠️ Still connecting... this can take up to a minute the first time (server waking up). Please wait.";
        statusEl.style.color = "var(--danger)";
    }

    console.error("Socket connect error:", err);

});

socket.on("disconnect", () => {

    const statusEl = document.getElementById("connectionStatus");

    if (statusEl) {
        statusEl.style.display = "block";
        statusEl.innerText = "❌ Disconnected from server. Reconnecting...";
        statusEl.style.color = "var(--danger)";
    }

});

/*
==========================
TAB SWITCHING (Create / Join)
==========================
*/
function showTab(tab){

    const createPanel = document.getElementById("createPanel");
    const joinPanel = document.getElementById("joinPanel");
    const tabCreate = document.getElementById("tabCreate");
    const tabJoin = document.getElementById("tabJoin");

    if(tab === "create"){

        createPanel.style.display = "block";
        joinPanel.style.display = "none";
        tabCreate.classList.add("active");
        tabJoin.classList.remove("active");

    }
    else{

        createPanel.style.display = "none";
        joinPanel.style.display = "block";
        tabCreate.classList.remove("active");
        tabJoin.classList.add("active");

    }

}

/*
==========================
LOAD EXAM LIST FOR "CREATE ROOM"
==========================
*/
async function loadExamsForSelect(retryCount = 0){

    const examSelect = document.getElementById("examSelect");

    try{

        const response =
        await fetch(`${SOCKET_URL}/api/exam/list`);

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const data =
        await response.json();

        if (!data.exams || data.exams.length === 0) {

            examSelect.innerHTML =
                `<option value="">No exams available</option>`;

            return;

        }

        let html = "";

        data.exams.forEach(exam => {

            html += `<option value="${exam._id}">${exam.title}</option>`;

        });

        examSelect.innerHTML = html;

    }
    catch(error){

        console.error("Failed to load exams:", error);

        if (retryCount < 3) {

            examSelect.innerHTML =
                `<option value="">🔄 Still loading... (server waking up, attempt ${retryCount + 1}/3)</option>`;

            setTimeout(() => {
                loadExamsForSelect(retryCount + 1);
            }, 5000);

        }
        else {

            examSelect.innerHTML =
                `<option value="">⚠️ Failed to load. Tap Create Room to retry.</option>`;

        }

    }

}

loadExamsForSelect();

/*
==========================
CREATE ROOM
==========================
*/
function createRoom(btn){

    if(actionInProgress) return;

    const examId =
    document.getElementById("examSelect").value;

    const userName =
    document.getElementById("createName").value.trim();

    if(!userName){
        alert("Please enter your name");
        return;
    }

    if(!examId){

        const examSelect = document.getElementById("examSelect");

        if (examSelect.options.length <= 1 && examSelect.value === "") {

            alert("Exams didn't load yet - retrying now, please wait a moment and try again.");
            loadExamsForSelect();
            return;

        }

        alert("Please choose an exam");
        return;
    }

    actionInProgress = true;

    const originalText = btn.innerText;
    btn.innerText = "⏳ Creating room...";
    btn.disabled = true;

    const timeoutId = setTimeout(() => {

        if(actionInProgress){
            btn.innerText = originalText;
            btn.disabled = false;
            actionInProgress = false;
            alert("Taking longer than expected. The server may still be waking up - please try again.");
        }

    }, 45000);

    socket.emit("create-room", {

        examId,

        userId: user ? user._id : `guest_${Date.now()}`,

        userName

    });

    socket.once("room-created", () => {
        clearTimeout(timeoutId);
        actionInProgress = false;
    });

    socket.once("room-error", () => {
        clearTimeout(timeoutId);
        actionInProgress = false;
        btn.innerText = originalText;
        btn.disabled = false;
    });

}

/*
==========================
JOIN ROOM
==========================
*/
function joinRoom(btn){

    if(actionInProgress) return;

    const roomCode =
    document.getElementById("roomCodeInput").value.trim().toUpperCase();

    const userName =
    document.getElementById("joinName").value.trim();

    if(!userName){
        alert("Please enter your name");
        return;
    }

    if(!roomCode){
        alert("Please enter a room code");
        return;
    }

    actionInProgress = true;

    const originalText = btn.innerText;
    btn.innerText = "⏳ Joining room...";
    btn.disabled = true;

    const timeoutId = setTimeout(() => {

        if(actionInProgress){
            btn.innerText = originalText;
            btn.disabled = false;
            actionInProgress = false;
            alert("Taking longer than expected. The server may still be waking up - please try again.");
        }

    }, 45000);

    socket.emit("join-room", {

        roomCode,

        userId: user ? user._id : `guest_${Date.now()}`,

        userName

    });

    socket.once("room-joined", () => {
        clearTimeout(timeoutId);
        actionInProgress = false;
    });

    socket.once("room-error", () => {
        clearTimeout(timeoutId);
        actionInProgress = false;
        btn.innerText = originalText;
        btn.disabled = false;
    });

}

/*
==========================
START GAME (host only)
==========================
*/
function startGame(btn){

    btn.disabled = true;
    btn.innerText = "⏳ Starting...";

    socket.emit("start-game");

    socket.once("room-error", () => {
        btn.disabled = false;
        btn.innerText = "🚀 Start Game";
    });

}

/*
==========================
LOBBY EVENTS
==========================
*/
socket.on("room-created", (room) => {

    currentRoom = room;

    showLobby(room);

});

socket.on("room-joined", (room) => {

    currentRoom = room;

    showLobby(room);

});

socket.on("lobby-update", (room) => {

    currentRoom = room;

    renderPlayerList(room);

    updateStartButton(room);

});

socket.on("room-error", (data) => {

    alert(data.message);

});

socket.on("room-closed", (data) => {

    alert(data.message);

    window.location.reload();

});

function showLobby(room){

    document.getElementById("setupView").style.display = "none";
    document.getElementById("lobbyView").style.display = "block";

    document.getElementById("lobbyRoomCode").innerText = room.roomCode;
    document.getElementById("lobbyExamTitle").innerText = `📝 ${room.examTitle}`;

    renderPlayerList(room);

    updateStartButton(room);

}

function renderPlayerList(room){

    const list = document.getElementById("playerList");

    let html = "";

    room.players.forEach((p, index) => {

        const isHost = index === 0;

        html += `
        <li>
            <span class="avatar-dot"></span>
            ${p.name}
            ${isHost ? '<span class="host-tag">Host</span>' : ''}
        </li>
        `;

    });

    list.innerHTML = html;

}

function updateStartButton(room){

    const startBtn = document.getElementById("startGameBtn");
    const waitingMsg = document.getElementById("waitingMessage");

    const isHost = room.hostSocketId === socket.id;

    if (isHost) {

        startBtn.style.display = "block";
        waitingMsg.style.display = "none";

        if (room.players.length < 2) {
            startBtn.disabled = true;
            startBtn.innerText = "Need at least 2 players...";
        } else {
            startBtn.disabled = false;
            startBtn.innerText = "🚀 Start Game";
        }

    } else {

        startBtn.style.display = "none";
        waitingMsg.style.display = "block";

    }

}

/*
==========================
GAME EVENTS
==========================
*/
socket.on("game-started", () => {

    document.getElementById("lobbyView").style.display = "none";
    document.getElementById("gameView").style.display = "block";

});

socket.on("new-question", (data) => {

    hasAnsweredCurrent = false;

    isSpectatorThisGame =
        currentRoom &&
        currentRoom.players.some(p =>
            p.userId === (user ? user._id : null) && p.isSpectator
        );

    document.getElementById("suddenDeathBanner").style.display =
        data.phase === "sudden-death" ? "block" : "none";

    document.getElementById("mpQuestionMeta").innerText =
        data.phase === "sudden-death"
            ? "⚡ Sudden Death"
            : `Question ${data.index + 1} / ${data.total}`;

    document.getElementById("mpQuestionText").innerText = data.question;

    document.getElementById("answerStatusText").innerText = "";

    renderOptions(data.options);

    startClientTimer(data.duration);

});

function renderOptions(options){

    const container = document.getElementById("mpOptions");

    let html = "";

    options.forEach((option, i) => {

        html += `
        <label class="option" onclick="submitAnswer(${i})">
            <span>${option}</span>
        </label>
        `;

    });

    container.innerHTML = html;

}

function submitAnswer(index){

    if (hasAnsweredCurrent) return;

    if (isSpectatorThisGame) return;

    hasAnsweredCurrent = true;

    // visually mark the chosen option
    const options = document.querySelectorAll("#mpOptions .option");

    options.forEach((el, i) => {

        if (i === index) {
            el.style.borderColor = "var(--accent)";
            el.style.background = "rgba(212,255,63,.1)";
        } else {
            el.style.opacity = "0.5";
        }

        el.style.pointerEvents = "none";

    });

    document.getElementById("answerStatusText").innerText =
        "✅ Answer submitted - waiting for others...";

    socket.emit("submit-answer", { selectedAnswer: index });

}

socket.on("answer-count-update", (data) => {

    if (!hasAnsweredCurrent) return;

    document.getElementById("answerStatusText").innerText =
        `✅ Answer submitted - ${data.answered}/${data.total} answered`;

});

socket.on("question-result", (data) => {

    stopClientTimer();

    // highlight correct/wrong options
    const options = document.querySelectorAll("#mpOptions .option");

    options.forEach((el, i) => {

        el.style.pointerEvents = "none";

        if (i === data.correctAnswer) {
            el.style.borderColor = "var(--success)";
            el.style.background = "rgba(74,222,128,.15)";
            el.style.opacity = "1";
        }

    });

    renderLiveScores(data.players);

});

function renderLiveScores(players){

    const list = document.getElementById("liveScoreList");

    const sorted = players.slice().sort((a, b) => b.score - a.score);

    let html = "";

    sorted.forEach(p => {

        let tag = "";

        if (p.eliminated) tag = '<span class="host-tag" style="color:var(--danger);">OUT</span>';
        else if (p.isSpectator) tag = '<span class="host-tag" style="color:var(--text-faint);">Spectating</span>';

        html += `
        <li>
            <span class="avatar-dot" style="background:${p.eliminated ? 'var(--danger)' : 'var(--success)'};"></span>
            ${p.name} - ${p.score} pts
            ${tag}
        </li>
        `;

    });

    list.innerHTML = html;

}

socket.on("sudden-death-start", (data) => {

    const names = data.contenders.map(c => c.name).join(" vs ");

    document.getElementById("mpQuestionMeta").innerText =
        `⚡ Tie for 1st place! ${names}`;

    document.getElementById("mpQuestionText").innerText =
        "Get ready for sudden death...";

    document.getElementById("mpOptions").innerHTML = "";

    const isContender =
        data.contenders.some(c => c.userId === (user ? user._id : null));

    document.getElementById("spectatorBanner").style.display =
        isContender ? "none" : "block";

});

/*
==========================
GAME OVER
==========================
*/
socket.on("game-over", (data) => {

    stopClientTimer();

    document.getElementById("gameView").style.display = "none";
    document.getElementById("gameOverView").style.display = "block";

    if (data.winner) {

        document.getElementById("winnerLabel").innerText = "🏆 Winner";
        document.getElementById("winnerName").innerText = data.winner.name;

    } else if (data.coWinners && data.coWinners.length > 0) {

        document.getElementById("winnerLabel").innerText = "🏆 Co-Winners";
        document.getElementById("winnerName").innerText =
            data.coWinners.map(w => w.name).join(" & ");

    } else {

        document.getElementById("winnerLabel").innerText = "Game Over";
        document.getElementById("winnerName").innerText = "-";

    }

    const list = document.getElementById("finalStandingsList");

    let html = "";

    data.finalStandings.forEach((p, index) => {

        let tag = "";

        if (index === 0) tag = '<span class="host-tag">🏆 1st</span>';
        else if (p.eliminated) tag = '<span class="host-tag" style="color:var(--danger);">Eliminated</span>';

        html += `
        <li>
            <span class="avatar-dot"></span>
            ${p.name} - ${p.score} pts
            ${tag}
        </li>
        `;

    });

    list.innerHTML = html;

});

/*
==========================
CLIENT-SIDE TIMER DISPLAY
(visual only - the SERVER enforces the real cutoff, this is just
so players see a countdown; it can't be exploited to cheat the timing)
==========================
*/
function startClientTimer(durationSeconds){

    stopClientTimer();

    let remaining = durationSeconds;

    document.getElementById("mpTimer").innerText = remaining;
    document.getElementById("mpProgressBar").style.width = "100%";

    const timerBox = document.getElementById("mpTimerBox");
    timerBox.style.background = "";

    clientTimerInterval = setInterval(() => {

        remaining--;

        if (remaining < 0) {
            stopClientTimer();
            return;
        }

        document.getElementById("mpTimer").innerText = remaining;

        const percent = (remaining / durationSeconds) * 100;

        document.getElementById("mpProgressBar").style.width = percent + "%";

        if (remaining <= 5) {
            timerBox.style.background = "#dc2626";
        }

    }, 1000);

}

function stopClientTimer(){

    clearInterval(clientTimerInterval);

}