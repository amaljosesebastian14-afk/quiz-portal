loadProfile();

async function loadProfile() {

    try {

        const response =
        await fetch(
            "https://quiz-portal-1lia.onrender.com/api/profile",
            {
                headers:{
                    Authorization:
                    `Bearer ${localStorage.getItem("firebaseToken")}`
                }
            }
        );

        const data =
        await response.json();

        console.log(data);

        if(!data.success){

            alert(data.message);

            return;
        }

        const profile =
        data.profile;

        document.getElementById(
            "name"
        ).innerText =
        profile.name || "-";

        document.getElementById(
            "email"
        ).innerText =
        profile.email || "-";

        document.getElementById(
            "attempts"
        ).innerText =
        profile.attempts || 0;

        document.getElementById(
            "highestScore"
        ).innerText =
        profile.highestScore || 0;

        document.getElementById(
            "avgScore"
        ).innerText =
        (profile.averageScore || 0) + "%";

    }
    catch(error){

        console.error(error);

    }

}

window.logout = function(){

    localStorage.clear();

    window.location =
    "login.html";

};