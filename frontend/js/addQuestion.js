loadExams();

async function loadExams() {

    const response =
    await fetch(
        "http://localhost:5000/api/exam/list"
    );

    const data =
    await response.json();

    let html = "";

    data.exams.forEach(exam => {

        html += `
        <option
         value="${exam._id}">
            ${exam.title}
        </option>
        `;
    });

    document
    .getElementById("examSelect")
    .innerHTML = html;
}

   async function addQuestion() {

    const token =
    localStorage.getItem(
        "firebaseToken"
    );

    if(!token){

        alert(
            "Please login again"
        );

        window.location =
        "login.html";

        return;
    }

    const examId =
    document.getElementById(
        "examSelect"
    ).value;

    const question =
    document.getElementById(
        "question"
    ).value;

    const options = [

        document.getElementById(
            "option1"
        ).value,

        document.getElementById(
            "option2"
        ).value,

        document.getElementById(
            "option3"
        ).value,

        document.getElementById(
            "option4"
        ).value

    ];

    const correctAnswer =
    Number(
        document.getElementById(
            "correctAnswer"
        ).value
    );

    try{

        const response =
        await fetch(
            "http://localhost:5000/api/question/add",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json",

                    "Authorization":
                    `Bearer ${token}`
                },

                body:JSON.stringify({

                    examId,
                    question,
                    options,
                    correctAnswer

                })
            }
        );

        const data =
        await response.json();

        console.log(data);

        if(data.success){

            alert(
                "Question Added Successfully"
            );

            document.getElementById(
                "question"
            ).value = "";

            document.getElementById(
                "option1"
            ).value = "";

            document.getElementById(
                "option2"
            ).value = "";

            document.getElementById(
                "option3"
            ).value = "";

            document.getElementById(
                "option4"
            ).value = "";

        }
        else{

            alert(
                data.message
            );

        }

    }
    catch(error){

        console.error(error);

        alert(
            "Failed to add question"
        );

    }

}