loadDashboard();

async function loadDashboard() {

    try {

        const response =
        await fetch(
            "http://localhost:5000/api/analytics/dashboard"
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