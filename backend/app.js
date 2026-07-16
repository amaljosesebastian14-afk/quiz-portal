require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");
const { connectRedis } = require("./config/redis");

const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const questionRoutes = require("./routes/questionRoutes");
const resultRoutes = require("./routes/resultRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const profileRoutes = require("./routes/profileRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/result", resultRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Quiz API Running"
    });
});

async function startServer() {
    try {

        await connectDB();

        //await connectRedis();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server Running On Port ${PORT}`);
        });

    } catch (error) {
        console.log(error);
    }
}

startServer();