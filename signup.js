// signUp.js
import { registerUser } from "./auth.js"; // ONLY import registerUser here!

const checkbox = document.getElementById('agreement-checkbox');
const submitBtn = document.getElementById('submit-input');
const signupForm = document.getElementById('signup-form');

// Terms & Conditions popup controls
const openTermsLink = document.getElementById('open-terms');
const closeTermsBtn = document.getElementById('close-terms');
const termsModal = document.getElementById('terms-modal');

openTermsLink.addEventListener('click', function(e) {
    e.preventDefault(); // Don't navigate, just open the popup
    termsModal.classList.add('open');
});

closeTermsBtn.addEventListener('click', function() {
    termsModal.classList.remove('open');
});

// Also close if the user clicks the dark overlay outside the popup box
termsModal.addEventListener('click', function(e) {
    if (e.target === termsModal) {
        termsModal.classList.remove('open');
    }
});

// Toggle button active state based on checkbox
checkbox.addEventListener('change', function() {
    submitBtn.disabled = !this.checked;
});

// Monitor submission
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop native HTML refresh

    // 1. Gather all written inputs
    const username = document.getElementById('username-input').value.trim();
    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value;
    const confirmPassword = document.getElementById('confirm-password-input').value;

    // 2. Client Side Validations
    if (!username || !email || !password || !confirmPassword) {
        alert("Fail: Please make sure all details are properly filled out!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Fail: Passwords do not match. Please verify your typing!");
        return;
    }

    try {
        // UI feedback
        submitBtn.disabled = true;
        submitBtn.value = "Creating Account...";

        // 3. Fire request to Firebase through auth.js
        const result = await registerUser(email, password, username);

        if (result.success) {
            alert("Account created successfully!");
            window.location.href = "LogIn.html"; // Redirects straight to login page
        }
    } catch (error) {
        // Reset button states
        submitBtn.disabled = false;
        submitBtn.value = "Submit";
        
        // Show failure message
        alert("Registration Failed: " + error.message);
    }
});