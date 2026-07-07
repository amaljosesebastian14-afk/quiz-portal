import { auth }
from "./firebase.js";

import {
    createUserWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

function friendlyError(error){

    const code =
    error.code || "";

    if(code === "auth/email-already-in-use"){
        return "That email is already registered. Try logging in instead.";
    }

    if(code === "auth/invalid-email"){
        return "Please enter a valid email address.";
    }

    if(code === "auth/weak-password"){
        return "Password should be at least 6 characters.";
    }

    if(code === "auth/network-request-failed"){
        return "Network error. Please check your connection and try again.";
    }

    return error.message ||
    "Something went wrong. Please try again.";

}

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

        const response =
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

        const data =
        await response.json();

        if(
            !response.ok ||
            data.success === false
        ){

            throw new Error(
                data.message ||
                "Account was created, but saving your profile failed. Please contact support or try logging in."
            );

        }

        alert(
            "Signup Successful"
        );

        window.location =
        "login.html";

    }
    catch(error){

        alert(
            friendlyError(error)
        );

    }

};