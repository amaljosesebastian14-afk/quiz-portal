loadAnalytics();

async function loadAnalytics() {

    try {

        const response =
        await fetch(
            "http://localhost:5000/api/analytics/dashboard"
        );

        const data =
        await response.json();

        document.getElementById(
            "totalUsers"
        ).innerText =
        data.totalUsers || 0;

        document.getElementById(
            "totalExams"
        ).innerText =
        data.totalExams || 0;

        document.getElementById(
            "totalAttempts"
        ).innerText =
        data.totalAttempts || 0;

        document.getElementById(
            "avgScore"
        ).innerText =
        (data.averageScore || 0) + "%";

        let html = "";

        if (
            data.recentResults &&
            data.recentResults.length > 0
        ) {

            data.recentResults.forEach(r => {

                html += `
                <tr>
                    <td>${r.email || "-"}</td>
                    <td>${r.examTitle || "-"}</td>
                    <td>${r.score || 0}</td>
                    <td>${r.percentage || 0}%</td>
                </tr>
                `;

            });

        } else {

            html = `
            <tr>
                <td colspan="4" class="no-data">
                    No Results Found
                </td>
            </tr>
            `;
        }

        document
        .getElementById("resultTable")
        .innerHTML = html;

    }
    catch(error){

        console.error(error);

    }

}