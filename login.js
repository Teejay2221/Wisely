// logIn.js
import { loginUser } from "./auth.js";

// MATCHES: id="loginForm" exactly from your HTML line 11
const loginForm = document.getElementById('loginForm'); 
// MATCHES: id="submit-input" exactly from your HTML line 29
const submitBtn = document.getElementById('submit-input');

// Just a quick alert to prove the JavaScript file loaded successfully on refresh
console.log("logIn.js has loaded successfully and is listening to the form!");

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop the page from refreshing automatically

    // Sanity check message to see in the console tab when you click submit
    console.log("Submit button clicked! Processing details...");

    // Gather text values from your HTML text fields
    const username = document.getElementById('username-input').value.trim();
    const password = document.getElementById('password-input').value;

    try {
        // Provide visual feedback
        submitBtn.disabled = true;
        submitBtn.value = "Logging in...";

        // Fire request to your auth.js backend engine
        const result = await loginUser(username, password);

        if (result.success) {
            alert("Login successful!");
            window.location.href = "index.html"; // Proceed directly to index.html
        }
    } catch (error) {
        // Reset button state if login fails so the user can re-try
        submitBtn.disabled = false;
        submitBtn.value = "Submit";
        
        // Show the specific error (e.g., incorrect username/password or network timeout)
        alert("Fail: " + error.message); 
    }
});