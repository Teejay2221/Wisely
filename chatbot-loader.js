// chatbot-loader.js
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat@0/dist/chat.bundle.es.js';

// Import your existing configured auth instance
import { auth } from './auth.js';

// Track authorization status on page load
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Force a token refresh to fetch the stripeRole custom claim from Firebase Auth metadata
    const tokenResult = await user.getIdTokenResult(true);
    const userRole = tokenResult.claims.stripeRole;

    if (userRole === 'premium') {
      console.log("Premium subscription detected. Unlocking Wisely AI Chatbot.");
      initN8nChatbot();
    } else {
      console.log("User tier: Free. AI Chatbot drawer remains locked.");
    }
  } else {
    console.log("No authenticated user detected. Chatbot disabled.");
  }
});

// Initialization function for the n8n Chat Module widget drawer
function initN8nChatbot() {
  createChat({
    webhookUrl: 'https://wisely3.app.n8n.cloud/webhook/cc234ca7-19e3-44d3-bc88-b1fe5889664/chat',
    target: '#n8n-chat',
    mode: 'window', 
    showWelcomeScreen: true,
    title: 'AI Assistant',
    subtitle: 'How can we help you today?',
    initialMessages: ['Hello My name is Wisely AI! How may I help you?'],
  });
}