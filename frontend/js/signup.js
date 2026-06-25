import { auth }
from "./firebase.js";

import {
    createUserWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

window.signup =
async function(){

    const name =
    document.getElementById(
        "name"
    ).value;

    const email =
    document.getElementById(
        "email"
    ).value;

    const password =
    document.getElementById(
        "password"
    ).value;

    const confirmPassword =
    document.getElementById(
        "confirmPassword"
    ).value;

    if(
        !name ||
        !email ||
        !password ||
        !confirmPassword
    ){
        alert(
            "Please fill all fields"
        );
        return;
    }

    if(
        password !==
        confirmPassword
    ){
        alert(
            "Passwords do not match"
        );
        return;
    }

    try{

        const userCredential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const firebaseUser =
        userCredential.user;

        await fetch(
            "https://quiz-portal-1lia.onrender.com/api/auth/login",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    name,
                    email,
                    firebaseUid:
                    firebaseUser.uid

                })

            }
        );

        alert(
            "Signup Successful"
        );

        window.location =
        "login.html";

    }
    catch(error){

        alert(
            error.message
        );

    }

};