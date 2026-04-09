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
    
    // Anonymous Login
    auth.signInAnonymously().catch((error) => {
        console.error("Firebase Auth Error:", error);
    });
} else {
    console.warn("Firebase not configured. Leaderboard will be disabled.");
}

async function updateLeaderboard(xp) {
    if (!db || !auth.currentUser) return;
    
    const userRef = db.collection("leaderboard").doc(auth.currentUser.uid);
    await userRef.set({
        name: "Anonymous User " + auth.currentUser.uid.slice(0, 4),
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
