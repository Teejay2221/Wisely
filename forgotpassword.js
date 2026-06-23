// Import auth from your local auth.js file
import { auth } from "./auth.js"; 
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const form = document.getElementById('signup-form');
const emailInput = document.getElementById('email-input');
const submitBtn = document.getElementById('submit-input');

emailInput.addEventListener('input', () => {
  if (emailInput.value.trim() !== "") {
    submitBtn.removeAttribute('disabled');
  } else {
    submitBtn.setAttribute('disabled', 'true');
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Uses the auth imported from your auth.js
  sendPasswordResetEmail(auth, emailInput.value)
    .then(() => {
      alert("A password reset link has been sent to your email!");
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});