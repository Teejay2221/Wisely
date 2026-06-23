// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your live Firebase configuration credentials
const firebaseConfig = {
    apiKey: "AIzaSyBgX0r8kuGHcC-mGBK2iFUCTyL26lhjL5U",
    authDomain: "wisely-e9f46.firebaseapp.com",
    projectId: "wisely-e9f46",
    storageBucket: "wisely-e9f46.appspot.com",
    messagingSenderId: "486283574518",
    appId: "1:486283574518:web:932b9c779f1c6ec49300d7",
    measurementId: "G-46J6RRHM32"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app); // <-- CHANGE 'const' TO 'export const' HERE

/**
 * Handles user registration with Firebase Auth and Firestore.
 */
export async function registerUser(email, password, username) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            createdAt: new Date()
        });

        return { success: true };
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * Handles user login by looking up their username to find their email,
 * then signing them in with Firebase Authentication.
 */
export async function loginUser(username, password) {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("Incorrect username or password.");
        }

        let email = "";
        querySnapshot.forEach((doc) => {
            email = doc.data().email;
        });

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };

    } catch (error) {
        if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
            throw new Error("Incorrect username or password.");
        }
        throw new Error(error.message);
    }
}

/**
 * Fetches user profile data (like custom username) from Firestore collection
 * to display across your navigation bar dynamically.
 */
export async function getUserProfile(uid) {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data(); // Contains the custom fields like username
        } else {
            console.log("No profile document found for user UID:", uid);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user profile from Firestore:", error);
        return null;
    }
}

/**
 * CORE STATE EXPORTS: Let other modules (like script2.js and navbar.js) 
 * easily save/load custom array datasets.
 */
export async function saveUserExpenses(uid, expensesArray) {
    try {
        await setDoc(doc(db, "expenses", uid), { expenses: expensesArray }, { merge: true });
        console.log("User tracking records synchronized safely.");
    } catch (error) {
        console.error("Error archiving expenses dataset:", error);
        // Re-throw so callers know the save failed instead of silently
        // showing local data that was never actually persisted.
        throw error;
    }
}

export async function getUserExpenses(uid) {
    try {
        const docSnap = await getDoc(doc(db, "expenses", uid));
        if (docSnap.exists()) {
            return docSnap.data().expenses || [];
        }
        return [];
    } catch (error) {
        console.error("Error recalling expenses dataset:", error);
        return [];
    }
}