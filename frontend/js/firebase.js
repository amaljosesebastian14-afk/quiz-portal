import { initializeApp }
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getAuth
}
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {

    apiKey:"AIzaSyC6SQOhYRcJsjp6enAFS0vUbXa6hVWU8Vc",

    authDomain:"quiz-app-1fc62.firebaseapp.com",

    projectId:"quiz-app-1fc62",

    storageBucket:"quiz-app-1fc62.firebasestorage.app",

    messagingSenderId:"856732133925",

    appId:"1:856732133925:web:6a0a23f08d75e652782dcc"
};

const app =
initializeApp(firebaseConfig);

export const auth =
getAuth(app);