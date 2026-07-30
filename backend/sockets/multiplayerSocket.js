const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

/*
In-memory room store. Fine for small friend-group rooms on a single
server instance. Structure per room:

{
    roomCode: "ABX921",
    examId: "...",
    examTitle: "...",
    hostSocketId: "...",
    status: "lobby" | "in-progress" | "sudden-death" | "finished",
    players: [
        { socketId, userId, name, score, eliminated, isSpectator }
    ],
    usedQuestionIds: Set(),
    questions: [],           // main round questions (filled when game starts)
    currentQuestionIndex: -1
}
*/
const rooms = new Map();

function generateRoomCode() {

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 - avoids confusion

    let code = "";

    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;

}

function generateUniqueRoomCode() {

    let code;

    do {
        code = generateRoomCode();
    } while (rooms.has(code));

    return code;

}

function getPublicRoomState(room) {

    return {

        roomCode: room.roomCode,

        examTitle: room.examTitle,

        status: room.status,

        hostSocketId: room.hostSocketId,

        players: room.players.map(p => ({
            userId: p.userId,
            name: p.name,
            score: p.score,
            eliminated: p.eliminated,
            isSpectator: p.isSpectator
        }))

    };

}

function initMultiplayer(io) {

    io.on("connection", (socket) => {

        /*
        ==========================
        CREATE ROOM
        ==========================
        */
        socket.on("create-room", async ({ examId, userId, userName }) => {

            try {

                const db = getDB();

                const exam =
                    await db.collection("exams")
                    .findOne({ _id: new ObjectId(examId) });

                if (!exam) {

                    socket.emit("room-error", {
                        message: "Selected exam not found."
                    });

                    return;

                }

                const roomCode = generateUniqueRoomCode();

                const room = {

                    roomCode,

                    examId,

                    examTitle: exam.title,

                    hostSocketId: socket.id,

                    status: "lobby",

                    players: [
                        {
                            socketId: socket.id,
                            userId,
                            name: userName,
                            score: 0,
                            eliminated: false,
                            isSpectator: false
                        }
                    ],

                    usedQuestionIds: new Set(),

                    questions: [],

                    currentQuestionIndex: -1

                };

                rooms.set(roomCode, room);

                socket.join(roomCode);

                socket.data.roomCode = roomCode;

                socket.emit("room-created", getPublicRoomState(room));

            }
            catch (error) {

                console.error("CREATE ROOM ERROR:", error);

                socket.emit("room-error", {
                    message: "Failed to create room."
                });

            }

        });

        /*
        ==========================
        JOIN ROOM
        ==========================
        */
        socket.on("join-room", ({ roomCode, userId, userName }) => {

            const code = (roomCode || "").toUpperCase().trim();

            const room = rooms.get(code);

            if (!room) {

                socket.emit("room-error", {
                    message: "Room not found. Check the code and try again."
                });

                return;

            }

            if (room.status !== "lobby") {

                socket.emit("room-error", {
                    message: "This game has already started."
                });

                return;

            }

            const alreadyIn =
                room.players.some(p => p.userId === userId);

            if (!alreadyIn) {

                room.players.push({
                    socketId: socket.id,
                    userId,
                    name: userName,
                    score: 0,
                    eliminated: false,
                    isSpectator: false
                });

            }

            socket.join(code);

            socket.data.roomCode = code;

            socket.emit("room-joined", getPublicRoomState(room));

            io.to(code).emit("lobby-update", getPublicRoomState(room));

        });

        /*
        ==========================
        LEAVE / DISCONNECT
        ==========================
        */
        socket.on("disconnect", () => {

            const code = socket.data.roomCode;

            if (!code) return;

            const room = rooms.get(code);

            if (!room) return;

            room.players =
                room.players.filter(p => p.socketId !== socket.id);

            // If the host disconnects during lobby, close the room -
            // simplest behavior for now rather than promoting a new host
            if (
                room.hostSocketId === socket.id &&
                room.status === "lobby"
            ) {

                io.to(code).emit("room-closed", {
                    message: "The host left. Room closed."
                });

                rooms.delete(code);

                return;

            }

            if (room.players.length === 0) {

                rooms.delete(code);

                return;

            }

            io.to(code).emit("lobby-update", getPublicRoomState(room));

        });

    });

}

module.exports = { initMultiplayer };