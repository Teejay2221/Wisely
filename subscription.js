// subscription.js
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat@0/dist/chat.bundle.es.js';
import { auth, db } from './auth.js';

/**
 * 1. DEFINE THE CHATBOT LAUNCHER
 * Dynamically accepts the user's Firebase UID to bridge the database context.
 */
function initN8nChatbot(userUid) {
  console.log("Initializing n8n chat widget component with context...");
  
  if (typeof createChat === "function") {
    createChat({
      webhookUrl: 'https://wisely4.app.n8n.cloud/webhook/e63e6897-32ec-4862-8433-59c7abb22856/chat',
      target: '#n8n-chat',
      mode: 'window', 
      showWelcomeScreen: true,
      stream: false, 
      
      // UPDATED: userId is now directly under metadata for proper n8n pathing
      metadata: {
        userId: userUid
      },
      
      i18n: {
        en: {
          welcome: {
            title: 'AI Assistant',
            subtitle: 'Hello My Name Is Wisely AI! How may I help you today?',
          },
          input: {
            placeholder: 'Type your question...',
          }
        }
      },
      initialMessages: ['Hello My Name Is Wisely AI! How may I help you today?'],
    });
  } else {
    console.error("CRITICAL: n8n createChat bundle did not load properly from the CDN.");
  }
}

/**
 * 2. AUTHENTICATION STATE OBSERVER WITH SAFE MULTI-PAGE CHECKS
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
        // ALWAYS launch the chatbot on any page if they are a premium user!
        initN8nChatbot(user.uid);
        
        // Safe check: Only update buttons if they actually exist on the current HTML page
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
        console.log("User tier: Free.");
        // Only run checkout setup if we are on the page containing the checkout button
        if (subscribeBtn) {
          setupCheckoutFlow(user.uid);
        }
      }
    } catch (error) {
      console.error("Error retrieving custom security claims token:", error);
    }
  } else {
    // Unauthenticated fallback -> If they click subscribe while logged out, send to login
    if (subscribeBtn) {
      subscribeBtn.addEventListener('click', () => {
        window.location.href = "LogIn.html";
      });
    }
  }
});

/**
 * 3. STRIPE CHECKOUT FLOW HANDLER
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
      const checkoutRef = collection(db, 'customers', uid, 'checkout_sessions');
      
      const docRef = await addDoc(checkoutRef, {
        price: 'price_1TlRlhHKPBm07W1PWsfVX8wN', 
        success_url: window.location.origin + window.location.pathname.replace('subscription.html', 'index.html'),
        cancel_url: window.location.href,
      });

      console.log("Document created! Waiting for extension response...");

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
