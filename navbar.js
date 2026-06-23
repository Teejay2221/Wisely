// navbar.js
import { getUserProfile } from "./auth.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const auth = getAuth();
const dropdownUsername = document.getElementById('dropdown-username');
const logoutBtn = document.getElementById('logout-btn');

// 0. Sidebar toggle, exposed on window so the inline onclick="toggleSidebar()"
// in the navbar HTML can find it. Functions declared inside a module (like
// this file) are scoped to the module and never attach to window on their
// own, so we have to do it explicitly here.
const sidebar = document.getElementById('sidebar');
window.toggleSidebar = function () {
    if (sidebar) {
        sidebar.classList.toggle('close');
    }
};

// 1. Fetch user data dynamically when any connected page mounts
onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (dropdownUsername) {
            try {
                const userProfile = await getUserProfile(user.uid);
                
                if (userProfile && userProfile.username) {
                    dropdownUsername.textContent = `@${userProfile.username}`;
                } else if (user.email) {
                    // Fallback to email prefix if username collection is empty
                    dropdownUsername.textContent = `@${user.email.split('@')[0]}`;
                } else {
                    dropdownUsername.textContent = "@User";
                }
                
                // Active link effects for profile routing redirection
                dropdownUsername.style.pointerEvents = "auto";
                dropdownUsername.style.cursor = "pointer";
                
            } catch (error) {
                console.error("Error displaying navbar user properties:", error);
                dropdownUsername.textContent = "@User";
            }
        }
    } else {
        // Kick unauthenticated sessions out to the login page safely
        if (!window.location.href.includes("LogIn.html") && !window.location.href.includes("SignUp.html")) {
            window.location.href = "LogIn.html";
        }
    }
});

// 2. Clear user session cookies on Log Out triggers
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
            window.location.href = "LogIn.html";
        }).catch((error) => {
            console.error("Logout extraction failed:", error);
        });
    });
}