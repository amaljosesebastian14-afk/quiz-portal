import { auth }
from "./firebase.js";

import {
    signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

window.login =
async function(){

    try{

        const email =
        document.getElementById("email").value;

        const password =
        document.getElementById("password").value;

        const credential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        const firebaseUser =
        credential.user;

        const token =
        await firebaseUser.getIdToken();

        localStorage.setItem(
            "firebaseToken",
            token
        );

        const response =
        await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    name:
                    firebaseUser.displayName || "",

                    email:
                    firebaseUser.email,

                    firebaseUid:
                    firebaseUser.uid

                })
            }
        );

        const data =
        await response.json();

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        alert(
            "Login Success"
        );

        if(
            data.user.role ===
            "admin"
        ){

            window.location =
            "admin-dashboard.html";

        }
        else{

            window.location =
            "dashboard.html";

        }

    }
    catch(error){

        alert(
            error.message
        );

    }

}