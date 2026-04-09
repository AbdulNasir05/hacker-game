var audioObj = new Audio("sound.mp3");
// Set starting life totals here
var playerLife = 5;
var hackerLife = 5;

// Gamification State
var playerXP = parseInt(localStorage.getItem('playerXP')) || 0;
var playerBadges = JSON.parse(localStorage.getItem('playerBadges')) || [];
var playerStreak = parseInt(localStorage.getItem('playerStreak')) || 0;
var lastPlayDate = localStorage.getItem('lastPlayDate');
var dailyChallengeCompleted = localStorage.getItem('dailyChallengeCompleted') === new Date().toDateString();

// Analytics State
var playerStats = JSON.parse(localStorage.getItem('playerStats')) || {
    "Network Security": { wins: 0, total: 0 },
    "Phishing": { wins: 0, total: 0 },
    "Privacy": { wins: 0, total: 0 },
    "Password Security": { wins: 0, total: 0 },
    "Data Protection": { wins: 0, total: 0 },
    "Malware": { wins: 0, total: 0 }
};
var xpHistory = JSON.parse(localStorage.getItem('xpHistory')) || [];
var currentCategory = "";

function checkStreak() {
  const today = new Date().toDateString();
  const dailyBtn = document.getElementById('daily-challenge-btn');
  
  if (dailyChallengeCompleted) {
      if (dailyBtn) {
          dailyBtn.innerText = "✅ Daily Done";
          dailyBtn.disabled = true;
      }
  }

  if (lastPlayDate !== today) {
    if (lastPlayDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastPlayDate === yesterday.toDateString()) {
        // Streak continues, but we only increment when they finish the daily challenge
      } else {
        playerStreak = 0;
        localStorage.setItem('playerStreak', playerStreak);
      }
    }
  }
}

var isDailyChallenge = false;
var dailyRound = 0;

function startDailyChallenge() {
    if (dailyChallengeCompleted) {
        alert("You've already completed today's challenge!");
        return;
    }
    
    isDailyChallenge = true;
    dailyRound = 0;
    startGame();
}

function updateGamificationUI() {
  const level = Math.floor(playerXP / 100) + 1;
  const xpInCurrentLevel = playerXP % 100;
  
  document.getElementById('player-level').innerText = level;
  document.getElementById('xp-bar').style.width = xpInCurrentLevel + '%';
  document.getElementById('stats-xp').innerText = playerXP;
  document.getElementById('stats-streak').innerText = playerStreak;
  
  // Update badges in UI
  playerBadges.forEach(badgeId => {
    const badgeEl = document.getElementById('badge-' + badgeId);
    if (badgeEl) badgeEl.classList.add('unlocked');
  });

  // Check for Cyber Master badge
  if (level >= 5 && !playerBadges.includes('master')) {
    unlockBadge('master');
  }
}

function unlockBadge(badgeId) {
  if (!playerBadges.includes(badgeId)) {
    playerBadges.push(badgeId);
    localStorage.setItem('playerBadges', JSON.stringify(playerBadges));
    updateGamificationUI();
    // Optional: Show a toast/notification
    console.log("Badge Unlocked: " + badgeId);
  }
}

function addXP(amount) {
  playerXP += amount;
  localStorage.setItem('playerXP', playerXP);
  
  // Track XP History for Analytics
  xpHistory.push({ timestamp: Date.now(), xp: playerXP });
  // Keep only last 50 entries to save space
  if (xpHistory.length > 50) xpHistory.shift();
  localStorage.setItem('xpHistory', JSON.stringify(xpHistory));

  updateGamificationUI();
  
  // Update Leaderboard if Firebase is configured
  if (typeof updateLeaderboard === 'function') {
      updateLeaderboard(playerXP);
  }
}

function updateAnalyticsUI() {
    const categoryStatsEl = document.getElementById('category-stats');
    const xpTrendEl = document.getElementById('xp-trend-container');
    const tipEl = document.getElementById('dynamic-tip');
    
    // Category Accuracy
    let categoryHTML = "";
    let weakestCategory = "";
    let minAccuracy = 101;

    for (const [category, data] of Object.entries(playerStats)) {
        const accuracy = data.total > 0 ? Math.round((data.wins / data.total) * 100) : 0;
        
        if (data.total > 0 && accuracy < minAccuracy) {
            minAccuracy = accuracy;
            weakestCategory = category;
        }

        categoryHTML += `
            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
                    <span>${category}</span>
                    <span>${accuracy}% (${data.wins}/${data.total})</span>
                </div>
                <div style="width: 100%; height: 8px; background: #222; border-radius: 4px; overflow: hidden; border: 1px solid #333;">
                    <div style="width: ${accuracy}%; height: 100%; background: ${accuracy > 70 ? '#4caf50' : accuracy > 40 ? '#ff9800' : '#f44336'}; transition: width 0.3s ease;"></div>
                </div>
            </div>
        `;
    }
    categoryStatsEl.innerHTML = categoryHTML;
    
    // Dynamic Tip
    const tips = {
        "Network Security": "Avoid using public Wi-Fi for sensitive tasks like banking. Use a VPN if you must connect.",
        "Phishing": "Always check the sender's email address and hover over links before clicking to spot fake websites.",
        "Privacy": "Review your social media privacy settings frequently and avoid sharing your real-time location.",
        "Password Security": "Use a unique, strong password for every account. Consider using a password manager.",
        "Data Protection": "Follow the 3-2-1 rule: 3 copies of data, on 2 different media, with 1 copy off-site.",
        "Malware": "Never plug in unknown USB drives and always keep your software and OS updated to the latest version."
    };

    if (weakestCategory && tips[weakestCategory]) {
        tipEl.innerText = `Focus on ${weakestCategory}: ${tips[weakestCategory]}`;
    } else {
        tipEl.innerText = "Keep playing scenarios to get personalized security tips!";
    }

    // XP Trend
    if (xpHistory.length > 0) {
        const maxXP = Math.max(...xpHistory.map(h => h.xp));
        xpTrendEl.innerHTML = xpHistory.slice(-20).map(h => {
            const height = (h.xp / (maxXP || 1)) * 100;
            return `<div style="flex: 1; height: ${height}%; background: #ffcc00; opacity: 0.6; border-radius: 2px 2px 0 0;" title="${h.xp} XP"></div>`;
        }).join("");
    } else {
        xpTrendEl.innerHTML = "<span style='font-size: 12px; color: #555;'>No data yet.</span>";
    }
}

async function toggleStats() {
  const modal = document.getElementById('stats-modal');
  const overlay = document.getElementById('modal-overlay');
  const isVisible = modal.style.display === 'block';
  
  modal.style.display = isVisible ? 'none' : 'block';
  overlay.style.display = isVisible ? 'none' : 'block';
  
  if (!isVisible) {
      updateGamificationUI();
      updateAnalyticsUI();
      loadLeaderboard();
      if (typeof updateAuthUI === 'function' && auth) {
          updateAuthUI(auth.currentUser);
      }
      // Initialize reCAPTCHA when modal is opened if not already done
      if (!window.recaptchaVerifier && auth) {
          window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
            'size': 'invisible'
          });
      }
  }
}

// Authentication Helpers
function toggleEmailForm() {
    const form = document.getElementById('email-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    document.getElementById('phone-form').style.display = 'none';
}

function togglePhoneForm() {
    const form = document.getElementById('phone-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    document.getElementById('email-form').style.display = 'none';
}

function handleEmailAuth(isSignUp) {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    if (!email || !password) return alert("Email and password required");
    signInWithEmail(email, password, isSignUp);
}

function handlePhoneAuth() {
    const phone = document.getElementById('phone-input').value;
    if (!phone) return alert("Phone number required (+1234567890)");
    signInWithPhone(phone);
}

function handlePhoneVerify() {
    const code = document.getElementById('verification-code').value;
    if (!code) return alert("Verification code required");
    verifyPhoneCode(code);
}

async function loadLeaderboard() {
    const listEl = document.getElementById('leaderboard-list');
    if (typeof fetchLeaderboard !== 'function' || !db) {
        listEl.innerHTML = "Firebase not configured.";
        return;
    }
    
    listEl.innerHTML = "Loading...";
    try {
        const topUsers = await fetchLeaderboard();
        if (topUsers.length === 0) {
            listEl.innerHTML = "No defenders yet.";
            return;
        }
        
        listEl.innerHTML = topUsers.map((user, index) => 
            `<div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #333;">
                <span>#${index + 1} ${user.name}</span>
                <span>${user.xp} XP</span>
            </div>`
        ).join("");
    } catch (e) {
        listEl.innerHTML = "Failed to load leaderboard.";
    }
}

// Initialize UI
updateGamificationUI();

// Message when the game is over
var hackerWinnerMessage = "Game over: You got hacked!";
var playerWinnerMessage = "You defeated the hacker!";


// Game code starts here
var playerStartLife = parseInt(playerLife);
var hackerStartLife = parseInt(hackerLife);

var roundFinished = false;
var cardSelected = false;

updateScores();

document.querySelector(".game-board").classList.add("before-game");

var allCardElements = document.querySelectorAll(".card");

// Adds click handler to all player card elements
for(var i = 0; i < allCardElements.length; i++) {
  var card = allCardElements[i];
  if(card.classList.contains("player-card")) {
    card.addEventListener("click",function(e){
      cardClicked(this);
    });
  }
}


// When a card is clicked
function cardClicked(cardEl) {

  if(cardSelected) { return; }
  cardSelected = true;

  cardEl.classList.add("played-card");

  document.querySelector(".game-board").classList.add("card-selected");

  // Wait 500ms to reveal the hacker power
  setTimeout(function(){
    revealHackerPower();
  },500)

  // Wait 750ms to reveal the player power
  setTimeout(function(){
    revealPlayerPower();
  },800)

  // Wait 1250ms to compare the card scoers
  setTimeout(function(){
    compareCards();
  }, 1400);
}

// Shows the power level on the player card
function revealPlayerPower(){
  var playerCard = document.querySelector(".played-card");
  playerCard.classList.add("reveal-power");
}

// Shows the power level on the hacker card
function revealHackerPower(){
  var hackerCard = document.querySelector(".hacker-card");
  hackerCard.classList.add("reveal-power");
}

function compareCards(){
  var playerCard = document.querySelector(".played-card");
  var playerPowerEl = playerCard.querySelector(".power");

  var hackerCard = document.querySelector(".hacker-card");
  var hackerPowerEl = hackerCard.querySelector(".power");

  var playerPower = parseInt(playerPowerEl.innerHTML);
  var hackerPower = parseInt(hackerPowerEl.innerHTML);

  var powerDifference = playerPower - hackerPower;

  // Track attempt for analytics
  if (currentCategory) {
    if (!playerStats[currentCategory]) {
        playerStats[currentCategory] = { wins: 0, total: 0 };
    }
    playerStats[currentCategory].total++;
  }

  if (powerDifference < 0) {
    // Player Loses
    playerLife = playerLife + powerDifference;
    hackerCard.classList.add("better-card");
    playerCard.classList.add("worse-card");
    document.querySelector(".player-stats .thumbnail").classList.add("ouch");
  } else if (powerDifference > 0) {
    // Player Wins
    hackerLife = hackerLife - powerDifference;
    playerCard.classList.add("better-card");
    hackerCard.classList.add("worse-card");
    document.querySelector(".hacker-stats .thumbnail").classList.add("ouch");
    
    // Add XP for round win
    addXP(10);
    
    // Track win for analytics
    if (currentCategory) {
        playerStats[currentCategory].wins++;
    }

    // Check for Perfect Shield badge
    if (playerPower >= 5) {
      unlockBadge('perfect');
    }
  } else {
    playerCard.classList.add("tie-card");
    hackerCard.classList.add("tie-card");
  }

  // Save analytics
  localStorage.setItem('playerStats', JSON.stringify(playerStats));

  updateScores();

  if(playerLife <= 0) {
    gameOver("Hacker");
  } else if (hackerLife <= 0){
    gameOver("Player")
  }

  roundFinished = true;

  document.querySelector("button.next-turn").removeAttribute("disabled");
}

// Shows the winner message
function gameOver(winner) {
  audioObj.pause();
  document.querySelector(".game-board").classList.add("game-over");
  document.querySelector(".winner-section").style.display = "flex";
  document.querySelector(".winner-section").classList.remove("player-color");
  document.querySelector(".winner-section").classList.remove("hacker-color");

  if(winner == "Hacker") {
    let evilAudio = new Audio("evil-laugh.mp3");
    evilAudio.play();
    document.querySelector(".winner-message").innerHTML = hackerWinnerMessage;
    document.querySelector(".winner-section").classList.add("hacker-color");
  } else {
    let ohNoAudio = new Audio("Oh-no-sound-effect.mp3");
    ohNoAudio.play();
    document.querySelector(".winner-message").innerHTML = playerWinnerMessage;
    document.querySelector(".winner-section").classList.add("player-color");

    // Game win rewards
    addXP(50);
    unlockBadge('first-win');
    
    // Survivor badge
    if (playerLife === 1) {
      unlockBadge('survivor');
    }

    // Daily Challenge Completion
    if (isDailyChallenge) {
        const today = new Date().toDateString();
        dailyChallengeCompleted = true;
        localStorage.setItem('dailyChallengeCompleted', today);
        
        // Update Streak
        if (lastPlayDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastPlayDate === yesterday.toDateString()) {
                playerStreak++;
            } else if (lastPlayDate !== today) {
                playerStreak = 1;
            }
        } else {
            playerStreak = 1;
        }
        
        localStorage.setItem('playerStreak', playerStreak);
        localStorage.setItem('lastPlayDate', today);
        
        // Bonus XP for daily challenge + streak
        const bonus = 50 + (20 * playerStreak);
        addXP(bonus);
        
        alert("Daily Challenge Complete! Streak: " + playerStreak + " days. Bonus XP: " + bonus);
        
        const dailyBtn = document.getElementById('daily-challenge-btn');
        if (dailyBtn) {
            dailyBtn.innerText = "✅ Daily Done";
            dailyBtn.disabled = true;
        }
    }
  }
  isDailyChallenge = false;
}


// Starts the game
function startGame() {
  checkStreak();
  audioObj.loop = true;
  audioObj.addEventListener("canplaythrough", event => {
    /* the audio is now playable; play it if permissions allow */
    myAudioElement.play();
  });
  audioObj.play();
  document.querySelector(".game-board").classList.remove("before-game");
  document.querySelector(".game-board").classList.add("during-game");
  playTurn();
}


function shareResult() {
    const level = Math.floor(playerXP / 100) + 1;
    const text = `I just reached Level ${level} with ${playerXP} XP in Sense Hacker! Can you beat my cyber defense skills? 🛡️👹 #SenseHacker #CyberSecurity`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

// Start the game over from scratch
function restartGame(){
  document.querySelector(".game-board").classList.remove("game-over");
  document.querySelector(".game-board").classList.remove("during-game");
  document.querySelector(".game-board").classList.add("before-game");

  document.querySelector(".winner-section").style.display = "none";
  document.querySelector(".hacker-card").style.display = "none";

  var cards = allCardElements;

  document.querySelector("button").removeAttribute("disabled");

  for(var i = 0; i < cards.length; i++) {
    cards[i].style.display = "none";
  }

  playerLife = playerStartLife;
  hackerLife = hackerStartLife;

  roundFinished = true;
  cardSelected = false;

  updateScores();
}

// Updates the displayed life bar and life totals
function updateScores(){

  // Update life totals for each player
  document.querySelector(".player-stats .life-total").innerHTML = playerLife;
  document.querySelector(".hacker-stats .life-total").innerHTML = hackerLife;

  // Update the player lifebar
  var playerPercent = playerLife / playerStartLife * 100;
  if (playerPercent < 0) {
    playerPercent = 0;
  }
  document.querySelector(".player-stats .life-left").style.height =  playerPercent + "%";

  // Update the hacker lifebar
  var hackerPercent = hackerLife / hackerStartLife * 100
  if (hackerPercent < 0) {
    hackerPercent = 0;
  }
  document.querySelector(".hacker-stats .life-left").style.height =  hackerPercent + "%";
}


// Shuffles an array
function shuffleArray(a) {
  var j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
  return a;
}


// Plays one turn of the game
function playTurn() {

  roundFinished = true;
  cardSelected = false;

  document.querySelector(".game-board").classList.remove("card-selected");

  // Remove "ouch" class from player and hacker thumbnails
  document.querySelector(".hacker-stats .thumbnail").classList.remove("ouch");
  document.querySelector(".player-stats .thumbnail").classList.remove("ouch");

  // Hides the "next turn" button, will show again when turn is over
  document.querySelector(".next-turn").setAttribute("disabled", "true");

  for(var i = 0; i < allCardElements.length; i++) {
    var card = allCardElements[i];
    card.classList.remove("showCard");
  }

  setTimeout(function(){
    revealCards();
  }, 500);
}

function revealCards(){

  var j = 0;
  var cardIndexes = shuffleArray([0, 1, 2]);

  // Reload scenarios if they run out (prevents crash)
  if (scenarios.length === 0) {
      if (typeof originalScenarios !== 'undefined') {
          scenarios = [...originalScenarios];
      } else {
          // Fallback if originalScenarios is not defined (requires cards.js to be structured to allow this)
          console.error("No more scenarios available!");
          return;
      }
  }

  // Get scenario cards
  console.log("scenarios.length == " + scenarios.length);

  var randomScenarioIndex;
  if (isDailyChallenge) {
    // Select scenario based on date + round number to ensure variation in the same session
    const today = new Date();
    const dateInt = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    randomScenarioIndex = (dateInt + dailyRound) % scenarios.length;
    console.log("Daily Challenge Scenario Index:", randomScenarioIndex, "Round:", dailyRound);
    dailyRound++;
  } else {
    randomScenarioIndex = Math.floor(Math.random() * scenarios.length);
  }
  
  var scenario = scenarios[randomScenarioIndex];
  currentCategory = scenario.category || "General";
  console.log(scenario.hackerCard.description);

  // Always splice to avoid repetition in any mode
  scenarios.splice(randomScenarioIndex, 1);

  console.log("scenarios.length after splice == " + scenarios.length);

  var hackerCard = scenario.hackerCard;
  var hackerCardEl = document.querySelector(".hacker-area .card");

  // Contents of the player cards
  var playerCards = scenario.playerCards;

  for(var i = 0; i < allCardElements.length; i++) {
    var card = allCardElements[i];

    card.classList.remove("worse-card");
    card.classList.remove("better-card");
    card.classList.remove("played-card");
    card.classList.remove("tie-card");
    card.classList.remove("prepared");
    card.classList.remove("reveal-power");

    // Display the payer card details
    if(card.classList.contains("player-card")) {
      card.querySelector(".text").innerHTML = playerCards[cardIndexes[j]].description;
      card.querySelector(".power").innerHTML = playerCards[cardIndexes[j]].power;
      j++;
    }

    // Reveal each card one by one with a delay of 100ms
    setTimeout(function(card, j){
      return function() {
        card.classList.remove("prepared");
        card.style.display = "block";
        card.classList.add("showCard");
      }
    }(card,i), parseInt(i+1) * 200);
  }

  // Display the hacker card
  hackerCardEl.querySelector(".text").innerHTML = hackerCard.description;
  hackerCardEl.querySelector(".power").innerHTML = hackerCard.power;
}
