const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

/*
In-memory room store. Fine for small friend-group rooms on a single
server instance.
*/
const rooms = new Map();

const QUESTION_DURATION_MS = 15000;
const RESULT_PAUSE_MS = 4000;

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

function getActivePlayers(room) {

    return room.players.filter(p => !p.eliminated && !p.isSpectator);

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

async function getRandomQuestions(db, examId, count, excludeIds = []) {

    return db.collection("questions").aggregate([
        { $match: { examId, _id: { $nin: excludeIds } } },
        { $sample: { size: count } }
    ]).toArray();

}

async function getRandomOtherExamQuestion(db, excludeExamId, excludeIds = []) {

    const results = await db.collection("questions").aggregate([
        { $match: { examId: { $ne: excludeExamId }, _id: { $nin: excludeIds } } },
        { $sample: { size: 1 } }
    ]).toArray();

    return results[0] || null;

}

function initMultiplayer(io) {

    /*
    ==========================
    SEND A QUESTION TO THE ROOM (used for both main round and sudden-death)
    ==========================
    */
    function sendQuestionToRoom(room, questionDoc, meta) {

        room.currentQuestion = questionDoc;

        room.currentAnswers = {};

        io.to(room.roomCode).emit("new-question", {

            ...meta,

            question: questionDoc.question,

            options: questionDoc.options,

            duration: QUESTION_DURATION_MS / 1000

        });

        clearTimeout(room.timer);

        room.timer = setTimeout(() => {
            resolveQuestion(room);
        }, QUESTION_DURATION_MS);

    }

    /*
    ==========================
    MAIN ROUND PROGRESSION
    ==========================
    */
    async function advanceMainRound(room) {

        room.mainQuestionIndex++;

        if (room.mainQuestionIndex >= room.questions.length) {

            finishMainRound(room);

            return;

        }

        const q = room.questions[room.mainQuestionIndex];

        sendQuestionToRoom(room, q, {
            phase: "main",
            index: room.mainQuestionIndex,
            total: room.questions.length
        });

    }

    /*
    ==========================
    RESOLVE THE CURRENT QUESTION (works for both main + sudden-death)
    ==========================
    */
    function resolveQuestion(room) {

        clearTimeout(room.timer);

        const q = room.currentQuestion;

        if (!q) return;

        const activePlayers = getActivePlayers(room);

        const results = [];

        activePlayers.forEach(p => {

            const selected = room.currentAnswers[p.socketId];

            const correct = selected === q.correctAnswer;

            if (room.status === "in-progress" && correct) {
                p.score++;
            }

            results.push({
                userId: p.userId,
                name: p.name,
                selected,
                correct
            });

        });

        io.to(room.roomCode).emit("question-result", {

            correctAnswer: q.correctAnswer,

            correctAnswerText: q.options[q.correctAnswer],

            results,

            players: getPublicRoomState(room).players

        });

        setTimeout(() => {

            if (room.status === "in-progress") {

                advanceMainRound(room);

            } else if (room.status === "sudden-death") {

                advanceSuddenDeath(room, results);

            }

        }, RESULT_PAUSE_MS);

    }

    /*
    ==========================
    MAIN ROUND FINISHED - CHECK FOR A TIE AT 1ST PLACE
    ==========================
    */
    function finishMainRound(room) {

        const players = room.players;

        const maxScore = Math.max(...players.map(p => p.score));

        const tied = players.filter(p => p.score === maxScore);

        if (tied.length <= 1) {

            finishGame(room, tied[0] || null);

            return;

        }

        // Tie at 1st place - enter sudden death.
        // Everyone NOT tied becomes a spectator immediately.
        room.status = "sudden-death";

        const tiedIds = tied.map(p => p.userId);

        room.players.forEach(p => {

            if (!tiedIds.includes(p.userId)) {
                p.isSpectator = true;
            }

        });

        io.to(room.roomCode).emit("sudden-death-start", {

            contenders: tied.map(p => ({
                userId: p.userId,
                name: p.name,
                score: p.score
            }))

        });

        setTimeout(() => {
            runSuddenDeathRound(room);
        }, RESULT_PAUSE_MS);

    }

    /*
    ==========================
    RUN ONE SUDDEN-DEATH QUESTION (from a DIFFERENT exam each time)
    ==========================
    */
    async function runSuddenDeathRound(room) {

        try {

            const db = getDB();

            const excludeIds =
                Array.from(room.usedQuestionIds).map(id => new ObjectId(id));

            const q = await getRandomOtherExamQuestion(db, room.examId, excludeIds);

            if (!q) {

                // Ran out of fresh questions entirely (very unlikely with
                // multiple exams in the app) - declare co-winners rather
                // than get stuck with no winner.
                const contenders = getActivePlayers(room);

                finishGame(room, null, contenders);

                return;

            }

            room.usedQuestionIds.add(q._id.toString());

            sendQuestionToRoom(room, q, { phase: "sudden-death" });

        }
        catch (error) {

            console.error("SUDDEN DEATH ROUND ERROR:", error);

        }

    }

    /*
    ==========================
    ELIMINATE WRONG ANSWERS, CHECK IF A WINNER HAS EMERGED
    ==========================
    */
    function advanceSuddenDeath(room, results) {

        const contenders = getActivePlayers(room);

        const wrongOnes = results.filter(r => !r.correct);

        const wouldEliminateEveryone =
            wrongOnes.length === contenders.length;

        // Only eliminate people if at least one contender remains after -
        // otherwise everyone got it wrong and no one is eliminated this round
        if (!wouldEliminateEveryone) {

            wrongOnes.forEach(r => {

                const p = room.players.find(pl => pl.userId === r.userId);

                if (p) p.eliminated = true;

            });

        }

        const remaining = getActivePlayers(room);

        if (remaining.length <= 1) {

            finishGame(room, remaining[0] || null);

            return;

        }

        runSuddenDeathRound(room);

    }

    /*
    ==========================
    GAME OVER
    ==========================
    */
    function finishGame(room, winner, coWinners = null) {

        room.status = "finished";

        clearTimeout(room.timer);

        const finalStandings =
            room.players
                .slice()
                .sort((a, b) => b.score - a.score)
                .map(p => ({
                    userId: p.userId,
                    name: p.name,
                    score: p.score,
                    eliminated: p.eliminated,
                    isSpectator: p.isSpectator
                }));

        io.to(room.roomCode).emit("game-over", {

            winner: winner
                ? { userId: winner.userId, name: winner.name, score: winner.score }
                : null,

            coWinners: coWinners
                ? coWinners.map(p => ({ userId: p.userId, name: p.name, score: p.score }))
                : null,

            finalStandings

        });

        // Keep the room around briefly as a safety net in case of
        // late/delayed socket events, then clean it up. Normal cleanup
        // happens sooner via the disconnect/leave-room handlers below
        // once players actually navigate away.
        setTimeout(() => {
            rooms.delete(room.roomCode);
        }, 60 * 1000);

    }

    function leaveRoom(socket) {

        const code = socket.data.roomCode;

        if (!code) return;

        const room = rooms.get(code);

        if (!room) return;

        room.players =
            room.players.filter(p => p.socketId !== socket.id);

        socket.leave(code);

        socket.data.roomCode = null;

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

    }

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

                    mainQuestionIndex: -1,

                    currentQuestion: null,

                    currentAnswers: {},

                    timer: null

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
        START GAME (host only)
        ==========================
        */
        socket.on("start-game", async () => {

            const code = socket.data.roomCode;

            const room = rooms.get(code);

            if (!room) return;

            if (room.hostSocketId !== socket.id) {

                socket.emit("room-error", {
                    message: "Only the host can start the game."
                });

                return;

            }

            if (room.players.length < 2) {

                socket.emit("room-error", {
                    message: "Need at least 2 players to start."
                });

                return;

            }

            try {

                const db = getDB();

                const questions =
                    await getRandomQuestions(db, room.examId, 10);

                if (questions.length < 10) {

                    socket.emit("room-error", {
                        message: "This exam doesn't have enough questions to start."
                    });

                    return;

                }

                room.questions = questions;

                questions.forEach(q => room.usedQuestionIds.add(q._id.toString()));

                room.mainQuestionIndex = -1;

                room.status = "in-progress";

                io.to(code).emit("game-started", {});

                advanceMainRound(room);

            }
            catch (error) {

                console.error("START GAME ERROR:", error);

                socket.emit("room-error", {
                    message: "Failed to start the game."
                });

            }

        });

        /*
        ==========================
        SUBMIT ANSWER
        ==========================
        */
        socket.on("submit-answer", ({ selectedAnswer }) => {

            const code = socket.data.roomCode;

            const room = rooms.get(code);

            if (!room) return;

            if (room.status !== "in-progress" && room.status !== "sudden-death") return;

            const player = room.players.find(p => p.socketId === socket.id);

            if (!player || player.eliminated || player.isSpectator) return;

            if (room.currentAnswers[socket.id] !== undefined) return; // already answered

            room.currentAnswers[socket.id] = selectedAnswer;

            const activePlayers = getActivePlayers(room);

            io.to(code).emit("answer-count-update", {
                answered: Object.keys(room.currentAnswers).length,
                total: activePlayers.length
            });

            if (Object.keys(room.currentAnswers).length >= activePlayers.length) {

                resolveQuestion(room);

            }

        });

        /*
        ==========================
        LEAVE ROOM (explicit, e.g. clicking Play Again / Dashboard)
        ==========================
        */
        socket.on("leave-room", () => {

            leaveRoom(socket);

        });

        /*
        ==========================
        DISCONNECT (e.g. closed tab, lost connection, page reload)
        ==========================
        */
        socket.on("disconnect", () => {

            leaveRoom(socket);

        });

    });

}

module.exports = { initMultiplayer };