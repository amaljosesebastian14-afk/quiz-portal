/*
==========================
TRIVIO - i18n ENGINE
==========================
Lightweight translation system. No build step, no framework.
Usage in HTML: <span data-i18n="dashboard.title">Dashboard</span>
The English text inside the tag is the fallback if a key is missing.
For placeholders: <input data-i18n-placeholder="login.emailPlaceholder">
*/

const TRANSLATIONS = {

    en: {

        // Shared navbar
        "nav.dashboard": "Dashboard",
        "nav.history": "History",
        "nav.myResults": "My Results",
        "nav.leaderboard": "Leaderboard",
        "nav.profile": "Profile",
        "nav.logout": "Logout",
        "nav.manageExams": "Manage Exams",
        "nav.addQuestion": "Add Question",
        "nav.analytics": "Analytics",

        // Login page
        "login.tagline": "🎓 Welcome back",
        "login.heroText": "Take online exams, track your scores, and compete on the leaderboard.",
        "login.statsUsers": "Users",
        "login.statsExams": "Exams hosted",
        "login.statsOnTime": "On-time rate",
        "login.feature1": "Real-time scoring and instant results",
        "login.feature2": "Live leaderboard across every exam",
        "login.feature3": "Track your progress over time",
        "login.heading": "Welcome Back",
        "login.subtitle": "Sign in to continue",
        "login.emailLabel": "Email",
        "login.emailPlaceholder": "Enter Email",
        "login.passwordLabel": "Password",
        "login.passwordPlaceholder": "Enter Password",
        "login.button": "Login",
        "login.noAccount": "Don't have an account?",
        "login.signUpLink": "Sign Up",

        // Signup page
        "signup.tagline": "🚀 Join Trivio",
        "signup.heroText": "Create your account and start taking quizzes, exams, and track your progress.",
        "signup.heading": "Create Account",
        "signup.subtitle": "Register to continue",
        "signup.nameLabel": "Name",
        "signup.namePlaceholder": "Enter Full Name",
        "signup.emailPlaceholder": "Enter Email",
        "signup.passwordPlaceholder": "Enter Password",
        "signup.confirmPasswordLabel": "Confirm Password",
        "signup.confirmPasswordPlaceholder": "Confirm Password",
        "signup.button": "Create Account",
        "signup.haveAccount": "Already have an account?",
        "signup.loginLink": "Login",

        // Dashboard
        "dashboard.heading": "📚 Available Exams",
        "dashboard.welcome": "Welcome back! Select an exam to begin."

    },

    ml: {

        // Shared navbar
        "nav.dashboard": "ഡാഷ്ബോർഡ്",
        "nav.history": "ചരിത്രം",
        "nav.myResults": "എന്റെ ഫലങ്ങൾ",
        "nav.leaderboard": "ലീഡർബോർഡ്",
        "nav.profile": "പ്രൊഫൈൽ",
        "nav.logout": "ലോഗ്ഔട്ട്",
        "nav.manageExams": "പരീക്ഷകൾ നിയന്ത്രിക്കുക",
        "nav.addQuestion": "ചോദ്യം ചേർക്കുക",
        "nav.analytics": "അനലിറ്റിക്സ്",

        // Login page
        "login.tagline": "🎓 തിരികെ സ്വാഗതം",
        "login.heroText": "ഓൺലൈൻ പരീക്ഷകൾ എഴുതുക, സ്കോർ ട്രാക്ക് ചെയ്യുക, ലീഡർബോർഡിൽ മത്സരിക്കുക.",
        "login.statsUsers": "ഉപയോക്താക്കൾ",
        "login.statsExams": "നടത്തിയ പരീക്ഷകൾ",
        "login.statsOnTime": "കൃത്യസമയ നിരക്ക്",
        "login.feature1": "തത്സമയ സ്കോറിംഗും തൽക്ഷണ ഫലങ്ങളും",
        "login.feature2": "എല്ലാ പരീക്ഷയിലും തത്സമയ ലീഡർബോർഡ്",
        "login.feature3": "നിങ്ങളുടെ പുരോഗതി ട്രാക്ക് ചെയ്യുക",
        "login.heading": "തിരികെ സ്വാഗതം",
        "login.subtitle": "തുടരാൻ സൈൻ ഇൻ ചെയ്യുക",
        "login.emailLabel": "ഇമെയിൽ",
        "login.emailPlaceholder": "ഇമെയിൽ നൽകുക",
        "login.passwordLabel": "പാസ്‌വേഡ്",
        "login.passwordPlaceholder": "പാസ്‌വേഡ് നൽകുക",
        "login.button": "ലോഗിൻ",
        "login.noAccount": "അക്കൗണ്ട് ഇല്ലേ?",
        "login.signUpLink": "സൈൻ അപ്പ്",

        // Signup page
        "signup.tagline": "🚀 ട്രിവിയോയിൽ ചേരുക",
        "signup.heroText": "അക്കൗണ്ട് ഉണ്ടാക്കി ക്വിസുകളും പരീക്ഷകളും ആരംഭിക്കുക, പുരോഗതി ട്രാക്ക് ചെയ്യുക.",
        "signup.heading": "അക്കൗണ്ട് ഉണ്ടാക്കുക",
        "signup.subtitle": "തുടരാൻ രജിസ്റ്റർ ചെയ്യുക",
        "signup.nameLabel": "പേര്",
        "signup.namePlaceholder": "മുഴുവൻ പേര് നൽകുക",
        "signup.emailPlaceholder": "ഇമെയിൽ നൽകുക",
        "signup.passwordPlaceholder": "പാസ്‌വേഡ് നൽകുക",
        "signup.confirmPasswordLabel": "പാസ്‌വേഡ് ഉറപ്പാക്കുക",
        "signup.confirmPasswordPlaceholder": "പാസ്‌വേഡ് വീണ്ടും നൽകുക",
        "signup.button": "അക്കൗണ്ട് ഉണ്ടാക്കുക",
        "signup.haveAccount": "അക്കൗണ്ട് ഉണ്ടോ?",
        "signup.loginLink": "ലോഗിൻ",

        // Dashboard
        "dashboard.heading": "📚 ലഭ്യമായ പരീക്ഷകൾ",
        "dashboard.welcome": "തിരികെ സ്വാഗതം! ആരംഭിക്കാൻ ഒരു പരീക്ഷ തിരഞ്ഞെടുക്കുക."

    }

};

function getCurrentLang() {

    return localStorage.getItem("lang") || "en";

}

function applyTranslations(lang) {

    const dict =
        TRANSLATIONS[lang] || TRANSLATIONS.en;

    document.querySelectorAll("[data-i18n]").forEach(el => {

        const key = el.getAttribute("data-i18n");

        if (dict[key]) {
            el.textContent = dict[key];
        }

    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {

        const key = el.getAttribute("data-i18n-placeholder");

        if (dict[key]) {
            el.placeholder = dict[key];
        }

    });

    document.documentElement.lang = lang;

    if (lang === "ml") {
        document.body.classList.add("lang-ml");
    } else {
        document.body.classList.remove("lang-ml");
    }

    const switcher =
        document.getElementById("langSwitcher");

    if (switcher) {
        switcher.value = lang;
    }

}

function setLanguage(lang) {

    localStorage.setItem("lang", lang);

    applyTranslations(lang);

}

document.addEventListener("DOMContentLoaded", function () {

    applyTranslations(getCurrentLang());

    const switcher =
        document.getElementById("langSwitcher");

    if (switcher) {

        switcher.addEventListener("change", function () {
            setLanguage(this.value);
        });

    }

});