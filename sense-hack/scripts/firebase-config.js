// Firebase Configuration - Replace with your own config from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase if config is provided
let db, auth;
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    
    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log("User signed in:", user.uid, user.isAnonymous ? "(Anonymous)" : "");
            updateAuthUI(user);
        } else {
            // Anonymous Login if not logged in
            auth.signInAnonymously().catch((error) => {
                console.error("Firebase Auth Error:", error);
            });
        }
    });
} else {
    console.warn("Firebase not configured. Leaderboard will be disabled.");
}

function updateAuthUI(user) {
    const authSection = document.getElementById('auth-section');
    const profileSection = document.getElementById('profile-info');
    if (!authSection || !profileSection) return;

    if (user && !user.isAnonymous) {
        authSection.style.display = 'none';
        profileSection.innerHTML = `
            <div style="margin-bottom: 10px;">
                <strong>Logged in as:</strong> ${user.displayName || user.email || user.phoneNumber}
                <button onclick="signOut()" style="margin-left: 10px; font-size: 10px; padding: 2px 5px;">Sign Out</button>
            </div>
        `;
    } else {
        authSection.style.display = 'block';
        profileSection.innerHTML = `<strong>Status:</strong> Playing Anonymously`;
    }
}

async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        if (auth.currentUser && auth.currentUser.isAnonymous) {
            await auth.currentUser.linkWithPopup(provider);
        } else {
            await auth.signInWithPopup(provider);
        }
    } catch (error) {
        console.error("Google Auth Error:", error);
        alert("Auth failed: " + error.message);
    }
}

async function signInWithEmail(email, password, isSignUp) {
    try {
        if (isSignUp) {
            if (auth.currentUser && auth.currentUser.isAnonymous) {
                const credential = firebase.auth.EmailAuthProvider.credential(email, password);
                await auth.currentUser.linkWithCredential(credential);
            } else {
                await auth.createUserWithEmailAndPassword(email, password);
            }
        } else {
            await auth.signInWithEmailAndPassword(email, password);
        }
        hideAuthForms();
    } catch (error) {
        console.error("Email Auth Error:", error);
        alert("Auth failed: " + error.message);
    }
}

let confirmationResult;
async function signInWithPhone(phoneNumber) {
    const appVerifier = window.recaptchaVerifier;
    try {
        confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, appVerifier);
        document.getElementById('phone-input-section').style.display = 'none';
        document.getElementById('phone-verify-section').style.display = 'block';
    } catch (error) {
        console.error("Phone Auth Error:", error);
        alert("Phone Auth failed: " + error.message);
        if (window.recaptchaVerifier) window.recaptchaVerifier.render();
    }
}

async function verifyPhoneCode(code) {
    try {
        if (auth.currentUser && auth.currentUser.isAnonymous) {
            const credential = firebase.auth.PhoneAuthProvider.credential(confirmationResult.verificationId, code);
            await auth.currentUser.linkWithCredential(credential);
        } else {
            await confirmationResult.confirm(code);
        }
        hideAuthForms();
    } catch (error) {
        console.error("Phone Verify Error:", error);
        alert("Verification failed: " + error.message);
    }
}

function signOut() {
    auth.signOut();
}

function hideAuthForms() {
    document.getElementById('email-form').style.display = 'none';
    document.getElementById('phone-form').style.display = 'none';
}

async function updateLeaderboard(xp) {
    if (!db || !auth.currentUser) return;
    
    const user = auth.currentUser;
    const name = user.displayName || (user.isAnonymous ? "Anonymous Defender " + user.uid.slice(0, 4) : (user.email ? user.email.split('@')[0] : "Defender " + user.uid.slice(0, 4)));
    
    const userRef = db.collection("leaderboard").doc(user.uid);
    await userRef.set({
        name: name,
        xp: xp,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

async function fetchLeaderboard() {
    if (!db) return [];
    
    const snapshot = await db.collection("leaderboard")
        .orderBy("xp", "desc")
        .limit(10)
        .get();
        
    return snapshot.docs.map(doc => doc.data());
}
