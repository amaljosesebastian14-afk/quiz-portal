loadDashboard();

async function loadDashboard() {

    try {

        const response =
        await fetch(
            "https://quiz-portal-1lia.onrender.com/api/analytics/dashboard"
        );

        const data =
        await response.json();

        document.getElementById(
            "totalExams"
        ).innerText =
        data.totalExams || 0;

        document.getElementById(
            "totalQuestions"
        ).innerText =
        data.totalQuestions || 0;

        document.getElementById(
            "totalUsers"
        ).innerText =
        data.totalUsers || 0;

        document.getElementById(
            "totalAttempts"
        ).innerText =
        data.totalAttempts || 0;

    } catch (error) {

        console.log(error);

    }
}