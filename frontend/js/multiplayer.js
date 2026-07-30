const SOCKET_URL = "https://quiz-portal-1lia.onrender.com";

const socket = io(SOCKET_URL);

const user =
JSON.parse(
    localStorage.getItem("user")
);

let currentRoom = null;

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
async function loadExamsForSelect(){

    try{

        const response =
        await fetch(`${SOCKET_URL}/api/exam/list`);

        const data =
        await response.json();

        let html = "";

        data.exams.forEach(exam => {

            html += `<option value="${exam._id}">${exam.title}</option>`;

        });

        document.getElementById("examSelect").innerHTML = html;

    }
    catch(error){

        console.error("Failed to load exams:", error);

    }

}

loadExamsForSelect();

/*
==========================
CREATE ROOM
==========================
*/
function createRoom(){

    const examId =
    document.getElementById("examSelect").value;

    const userName =
    document.getElementById("createName").value.trim();

    if(!userName){
        alert("Please enter your name");
        return;
    }

    if(!examId){
        alert("Please choose an exam");
        return;
    }

    socket.emit("create-room", {

        examId,

        userId: user ? user._id : `guest_${Date.now()}`,

        userName

    });

}

/*
==========================
JOIN ROOM
==========================
*/
function joinRoom(){

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

    socket.emit("join-room", {

        roomCode,

        userId: user ? user._id : `guest_${Date.now()}`,

        userName

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