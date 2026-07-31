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

        // Server may still be waking up (Render free tier cold start) -
        // retry a couple of times before showing a permanent error
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
SOCKET EVENT HANDLERS
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

});

socket.on("room-error", (data) => {

    alert(data.message);

});

socket.on("room-closed", (data) => {

    alert(data.message);

    window.location.reload();

});

/*
==========================
UI RENDERING
==========================
*/
function showLobby(room){

    document.getElementById("setupView").style.display = "none";
    document.getElementById("lobbyView").style.display = "block";

    document.getElementById("lobbyRoomCode").innerText = room.roomCode;
    document.getElementById("lobbyExamTitle").innerText = `📝 ${room.examTitle}`;

    renderPlayerList(room);

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