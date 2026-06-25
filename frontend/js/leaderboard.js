loadLeaderboard();

async function loadLeaderboard() {

    try {

        const examId =
        localStorage.getItem(
            "examId"
        );

        console.log(
            "Exam ID:",
            examId
        );

        const response =
        await fetch(
            `https://quiz-portal-1lia.onrender.com/api/result/leaderboard/${examId}`
        );

        const data =
        await response.json();

        console.log(data);

        let html = "";

        if (
            data.leaderboard &&
            data.leaderboard.length > 0
        ) {

            data.leaderboard.forEach(
                (user, index) => {

                    html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.score}</td>
                        <td>${user.percentage}%</td>
                    </tr>
                    `;
                }
            );

        } else {

            html = `
            <tr>
                <td colspan="5">
                    No leaderboard data found
                </td>
            </tr>
            `;
        }

        document
        .getElementById(
            "leaderboard"
        )
        .innerHTML = html;

    }
    catch(error){

        console.error(error);

    }

}