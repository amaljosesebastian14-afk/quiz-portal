const user =
JSON.parse(
    localStorage.getItem("user")
);

loadHistory();

async function loadHistory() {

    try {

        const response =
        await fetch(
            `http://localhost:5000/api/result/user/${user._id}`
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
                <td colspan="4">
                    No Exam History Found
                </td>
            </tr>
            `;

        } else {

            data.results.forEach(result => {

                html += `

                <tr>

                    <td>
                        ${result.examTitle || "-"}
                    </td>

                    <td>
                        ${result.score || 0}
                        /
                        ${result.totalQuestions || 0}
                    </td>

                    <td>
                        ${result.percentage || 0}%
                    </td>

                    <td>
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
            <td colspan="4">
                Failed to load history
            </td>
        </tr>
        `;
    }

}