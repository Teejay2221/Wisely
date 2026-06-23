// subscription.js
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat@0/dist/chat.bundle.es.js';
// Import your centralized auth and db configurations
import { auth, db } from './auth.js';

/**
 * 1. DEFINE THE CHATBOT LAUNCHER FIRST
 * Keeps the browser from throwing an uncaught ReferenceError.
 */
function initN8nChatbot() {
  console.log("Initializing n8n chat widget component...");
  
  if (typeof createChat === "function") {
    createChat({
      webhookUrl: 'https://wisely3.app.n8n.cloud/webhook/cc234ca7-19e3-44d3-bc88-b1fe5889664/chat',
      target: '#n8n-chat',
      mode: 'window', 
      showWelcomeScreen: true,
      
      // ==========================================
      // ADD THIS LINE RIGHT HERE TO FIXED THE JSON PROBLEM:
      // ==========================================
      stream: true, 
      
      title: 'AI Assistant',
      subtitle: 'Hello My Name Is Wisely AI! How may I help you today?',
      initialMessages: ['Hello My Name Is Wisely AI! How may I help you today?'],
    });
  } else {
    console.error("CRITICAL: n8n createChat bundle did not load properly from the CDN.");
  }
}

/**
 * 2. AUTHENTICATION STATE OBSERVER WITH FORCED TOKEN REFRESH
 */
onAuthStateChanged(auth, async (user) => {
  const subscribeBtn = document.getElementById('subscribeBtn');
  const freeBtn = document.getElementById('freeBtn');

  if (user) {
    try {
      // Force a token refresh to fetch custom claims populated via Stripe webhook
      const tokenResult = await user.getIdTokenResult(true);
      const userRole = tokenResult.claims.stripeRole;

      console.log("Current detected Stripe Role claim:", userRole);

      if (userRole === 'premium') {
        // User has successfully checked out -> Enable AI Chatbot
        initN8nChatbot();
        if (subscribeBtn) {
          subscribeBtn.innerText = "Current Plan Active";
          subscribeBtn.style.opacity = "0.5";
          subscribeBtn.disabled = true;
        }
        if (freeBtn) {
          freeBtn.innerText = "Free Tier Locked";
          freeBtn.disabled = true;
        }
      } else {
        console.log("User tier: Free. Initializing Stripe session handler.");
        setupCheckoutFlow(user.uid);
      }
    } catch (error) {
      console.error("Error retrieving custom security claims token:", error);
    }
  } else {
    // Unauthenticated fallback -> Send them to registration/login
    if (subscribeBtn) {
      subscribeBtn.addEventListener('click', () => {
        window.location.href = "LogIn.html";
      });
    }
  }
});

/**
 * 3. STRIPE CHECKOUT FLOW HANDLER
 * Writes parameters to users customers subcollection watched by Firebase extension
 */
function setupCheckoutFlow(uid) {
  const subscribeBtn = document.getElementById('subscribeBtn');
  
  if (!subscribeBtn) return;

  subscribeBtn.addEventListener('click', async () => {
    if (!uid) {
      console.error("User ID is missing.");
      return;
    }

    subscribeBtn.innerText = "Processing...";
    subscribeBtn.disabled = true;

    try {
      // Pin to the core root path expected by the extension
      const checkoutRef = collection(db, 'customers', uid, 'checkout_sessions');
      
      const docRef = await addDoc(checkoutRef, {
        price: 'price_1TlRlhHKPBm07W1PWsfVX8wN', 
        success_url: window.location.origin + "/index.html",
        cancel_url: window.location.href,
      });

      console.log("Document created! Waiting for extension response...");

      // Watch for changes on the session object until Stripe produces a valid checkout URL
      onSnapshot(docRef, (snapshot) => {
        const sessionData = snapshot.data();
        if (sessionData && sessionData.url) {
          console.log("Redirecting to Stripe Checkout:", sessionData.url);
          window.location.assign(sessionData.url);
        } else if (sessionData && sessionData.error) {
          console.error("Stripe Extension returned an error:", sessionData.error.message);
          alert("Stripe Error: " + sessionData.error.message);
          subscribeBtn.innerText = "Subscribe Now";
          subscribeBtn.disabled = false;
        }
      });
    } catch (error) {
      console.error("Firestore database mapping failed:", error);
      alert("Checkout failed to initialize. Check console permissions.");
      subscribeBtn.innerText = "Subscribe Now";
      subscribeBtn.disabled = false;
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  const subscribeBtn = document.getElementById('subscribeBtn');
  const freeBtn = document.getElementById('freeBtn');

  if (user) {
    try {
      // Force token refresh to fetch custom claims populated via Stripe webhook
      const tokenResult = await user.getIdTokenResult(true);
      const userRole = tokenResult.claims.stripeRole;

      console.log("Current detected Stripe Role claim:", userRole);

      if (userRole === 'premium') {
        // User has successfully checked out -> Enable AI Chatbot on whatever page they are on!
        initN8nChatbot();
        
        // SAFE CHECKS: Only update these elements if they exist on the current page
        if (subscribeBtn) {
          subscribeBtn.innerText = "Current Plan Active";
          subscribeBtn.style.opacity = "0.5";
          subscribeBtn.disabled = true;
        }
        if (freeBtn) {
          freeBtn.innerText = "Free Tier Locked";
          freeBtn.disabled = true;
        }
      } else {
        console.log("User tier: Free. Initializing Stripe session handler.");
        setupCheckoutFlow(user.uid);
      }
    } catch (error) {
      console.error("Error retrieving custom security claims token:", error);
    }
  } else {
    // Unauthenticated fallback -> Only attach event if the button is present
    if (subscribeBtn) {
      subscribeBtn.addEventListener('click', () => {
        window.location.href = "LogIn.html";
      });
    }
  }
});
