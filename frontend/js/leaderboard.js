function t(key, fallback) {

    const lang =
        (typeof getCurrentLang === "function")
            ? getCurrentLang()
            : "en";

    return (
        typeof TRANSLATIONS !== "undefined" &&
        TRANSLATIONS[lang] &&
        TRANSLATIONS[lang][key]
    ) || fallback;

}

loadLeaderboard();

async function loadLeaderboard() {

    try {

        const examId =
        localStorage.getItem(
            "examId"
        );

        const response =
        await fetch(
            `https://quiz-portal-1lia.onrender.com/api/result/leaderboard/${examId}`
        );

        const data =
        await response.json();

        let html = "";

        if (
            data.leaderboard &&
            data.leaderboard.length > 0
        ) {

            data.leaderboard.forEach(
                (user, index) => {

                    html += `
                    <tr>
                        <td data-label="${t('leaderboard.colRank','Rank')}">${index + 1}</td>
                        <td data-label="${t('leaderboard.colName','Name')}">${user.name}</td>
                        <td data-label="${t('leaderboard.colEmail','Email')}">${user.email}</td>
                        <td data-label="${t('leaderboard.colScore','Score')}">${user.score}</td>
                        <td data-label="${t('leaderboard.colPercentage','Percentage')}">${user.percentage}%</td>
                    </tr>
                    `;
                }
            );

        } else {

            html = `
            <tr>
                <td colspan="5" class="no-data">
                    ${t('leaderboard.noData', 'No leaderboard data found')}
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

        document
        .getElementById(
            "leaderboard"
        )
        .innerHTML = `
        <tr>
            <td colspan="5" class="no-data">
                ${t('leaderboard.failedLoad', 'Failed to load leaderboard')}
            </td>
        </tr>
        `;
    }

}