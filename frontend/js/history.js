const user =
JSON.parse(
    localStorage.getItem("user")
);

if (!user) {

    alert(
        "Please login again"
    );

    window.location =
    "login.html";

}
else {

    loadHistory();

}

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

async function loadHistory() {

    try {

        const response =
        await fetch(
            `https://quiz-portal-1lia.onrender.com/api/result/user/${user._id}`
        );

        const data =
        await response.json();

        let html = "";

        if (
            !data.results ||
            data.results.length === 0
        ) {

            html = `
            <tr>
                <td colspan="4" class="no-data">
                    ${t("history.noData", "No Exam History Found")}
                </td>
            </tr>
            `;

        } else {

            data.results.forEach(result => {

                html += `

                <tr>

                    <td data-label="${t('history.colExam','Exam Name')}">
                        ${result.examTitle || "-"}
                    </td>

                    <td data-label="${t('history.colScore','Score')}">
                        ${result.score || 0}
                        /
                        ${result.totalQuestions || 0}
                    </td>

                    <td data-label="${t('history.colPercentage','Percentage')}">
                        ${result.percentage || 0}%
                    </td>

                    <td data-label="${t('history.colDate','Date')}">
                        ${
                            result.submittedAt
                            ? new Date(
                                result.submittedAt
                            ).toLocaleDateString(
                                "en-IN"
                            )
                            : "-"
                        }
                    </td>

                </tr>

                `;
            });

        }

        document
        .getElementById(
            "historyTable"
        )
        .innerHTML = html;

    }
    catch(error){

        console.error(error);

        document
        .getElementById(
            "historyTable"
        )
        .innerHTML = `
        <tr>
            <td colspan="4" class="no-data">
                ${t("history.failedLoad", "Failed to load history")}
            </td>
        </tr>
        `;
    }

}