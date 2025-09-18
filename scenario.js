// scenario.js - Crisis Scenario System

// Crisis Events Configuration
const CRISIS_EVENTS = {
  5: {
    headline: "🏠 Housing Bubble Bursts",
    body: "Subprime mortgage crisis triggers massive foreclosures. Major banks report billions in losses as housing prices plummet nationwide.",
    priceShock: 0.85 // 15% drop
  },
  10: {
    headline: "🏛️ Lehman Brothers Collapses",
    body: "Investment banking giant Lehman Brothers files for bankruptcy. Credit markets freeze as panic spreads through Wall Street.",
    priceShock: 0.70 // 30% drop
  },
  15: {
    headline: "💸 Government Bailout Package",
    body: "Federal Reserve announces emergency $700 billion bailout package. Markets show signs of stabilization but uncertainty remains high.",
    priceShock: 1.15 // 15% recovery
  }
};

// News Ticker Messages
const TICKER_MESSAGES = [
  "Dow Jones drops 777 points in single session",
  "Bear Stearns acquired by JPMorgan for $2 per share",
  "A New Phase in Finance Crisis as Investors Run to Safety - NYT",
  "AIG receives $85 billion government bailout",
  "Foreclosure rates hit record highs nationwide",
  "Worst Crisis Since 1930s, with No End Yet in Sight - WSJ",
  "Unemployment rises to 6.1%, highest in 5 years",
  "Credit markets remain frozen as banks hoard cash",
  "U.S. Loses 533,000 Jobs in Biggest Drop Since 1974 - NYT",
  "Crisis spreads globally as European banks report losses",
  "Oil prices volatile amid economic uncertainty",
  "Major corporations announce massive layoffs",
  "Europe cuts interest rate to 3.25% - The Times"
];

// DOM Elements
let headlineModal = null;
let newsTicker = null;
let crashOverlay = null;

// Initialize scenario system
function initScenarioSystem() {
  createHeadlineModal();
  createNewsTicker();
  createCrashOverlay();
  startNewsTicker();
}

// Create headline modal
function createHeadlineModal() {
  headlineModal = document.createElement('div');
  headlineModal.id = 'headline-modal';
  headlineModal.className = 'headline-modal hidden';
  headlineModal.innerHTML = `
    <div class="headline-content">
      <h2 id="headline-title">Breaking News</h2>
      <p id="headline-body">Crisis update...</p>
      <button id="headline-continue" class="headline-btn">Continue</button>
    </div>
  `;
  document.body.appendChild(headlineModal);

  // Event listeners
  const continueBtn = document.getElementById('headline-continue');
  continueBtn.addEventListener('click', hideHeadlineModal);

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !headlineModal.classList.contains('hidden')) {
      hideHeadlineModal();
    }
  });
}

// Create news ticker
function createNewsTicker() {
  newsTicker = document.createElement('div');
  newsTicker.id = 'news-ticker';
  newsTicker.innerHTML = `
    <div class="ticker-content">
      <span class="ticker-label">📺 BREAKING:</span>
      <div class="ticker-scroll">
        <div class="ticker-text" id="ticker-text"></div>
      </div>
    </div>
  `;
  document.body.appendChild(newsTicker);
}

// Create crash overlay
function createCrashOverlay() {
  crashOverlay = document.createElement('div');
  crashOverlay.id = 'crash-overlay';
  crashOverlay.className = 'crash-overlay hidden';
  document.body.appendChild(crashOverlay);
}

// Show headline modal
function showHeadlineModal(event) {
  const titleEl = document.getElementById('headline-title');
  const bodyEl = document.getElementById('headline-body');
  
  titleEl.textContent = event.headline;
  bodyEl.textContent = event.body;
  
  headlineModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  
  // Show crash tint if it's a negative event
  if (event.priceShock < 1.0) {
    showCrashTint();
  }
}

// Hide headline modal
function hideHeadlineModal() {
  headlineModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  hideCrashTint();
}

// Show crash tint
function showCrashTint() {
  crashOverlay.classList.remove('hidden');
  setTimeout(() => {
    crashOverlay.classList.add('hidden');
  }, 2000);
}

// Hide crash tint
function hideCrashTint() {
  crashOverlay.classList.add('hidden');
}

// Start news ticker
function startNewsTicker() {
  const tickerText = document.getElementById('ticker-text');
  
  // Create continuous scrolling text with all messages separated by |
  function createContinuousTickerText() {
    return TICKER_MESSAGES.join('    |    ') + '    |    '; // Add extra separator at the end
  }
  
  // Set the continuous ticker text
  tickerText.textContent = createContinuousTickerText();
  
  // Optional: Update the ticker content periodically to add variety
  setInterval(() => {
    // Shuffle the messages occasionally for variety
    const shuffled = [...TICKER_MESSAGES].sort(() => Math.random() - 0.5);
    tickerText.textContent = shuffled.join(' | ') + ' | ';
  }, 120000); // Shuffle every 2 minutes
}

// Check for crisis events on day change
function checkCrisisEvent(currentDay) {
  const event = CRISIS_EVENTS[currentDay];
  if (event) {
    // Apply market shock first
    if (event.priceShock && typeof applyMarketShock === 'function') {
      applyMarketShock(event.priceShock);
    }
    
    // Show headline modal
    setTimeout(() => {
      showHeadlineModal(event);
    }, 500);
    
    return true;
  }
  return false;
}

// Apply market shock to all companies
function applyMarketShock(multiplier) {
  console.log(`Applying market shock with ${multiplier} multiplier`);
  
  // Check if global variables exist
  if (typeof history === 'undefined' || typeof ohlc === 'undefined') {
    console.error('Market data not available');
    return;
  }
  
  for (const company in history) {
    if (!Array.isArray(history[company]) || history[company].length === 0) continue;
    
    // Apply shock to the latest price
    const lastIndex = history[company].length - 1;
    const originalPrice = history[company][lastIndex];
    const shockedPrice = +(originalPrice * multiplier).toFixed(2);
    history[company][lastIndex] = Math.max(shockedPrice, 0.01); // Prevent negative prices

    // Update OHLC data
    if (Array.isArray(ohlc[company]) && ohlc[company].length > 0) {
      const lastOhlcIndex = ohlc[company].length - 1;
      const prevClose = lastOhlcIndex > 0 ? ohlc[company][lastOhlcIndex - 1].c : shockedPrice;
      
      ohlc[company][lastOhlcIndex] = {
        o: prevClose,
        h: Math.max(prevClose, shockedPrice) + Math.random() * 3,
        l: Math.min(prevClose, shockedPrice) - Math.random() * 8,
        c: shockedPrice
      };
    }
  }
  
  // Refresh UI if the function exists
  if (typeof refreshUI === 'function') {
    refreshUI();
  }
}

// Show endgame message - updated to handle profit/loss
function showEndgameMessage(finalBalance, profitLoss) {
  let message, title;
  
  const profitSign = profitLoss >= 0 ? '+' : '';
  
  if (profitLoss > 5000) {
    title = "🎯 Crisis Survivor";
    message = `Incredible! You navigated the 2008 financial crisis with a profit of ${profitSign}$${profitLoss.toLocaleString()}. Your strategic trading during one of history's worst market crashes proves you have what it takes to thrive in chaos.`;
  } else if (profitLoss > 0) {
    title = "💪 Steady Hand";
    message = `Well done! You weathered the storm and made a profit of ${profitSign}$${profitLoss.toLocaleString()}. While others panicked, you kept your composure and preserved your capital during the market meltdown.`;
  } else if (profitLoss > -5000) {
    title = "📉 Bruised but Breathing";
    message = `You lost $${Math.abs(profitLoss).toLocaleString()}, but survived the 2008 crisis. The market was brutal, but you managed to keep most of your capital intact. Many weren't so fortunate during this historic market collapse.`;
  } else {
    title = "💥 Casualty of Crisis";
    message = `The crisis hit hard, with losses of $${Math.abs(profitLoss).toLocaleString()}. Don't feel bad - even seasoned Wall Street veterans lost billions during the 2008 financial meltdown. Learn from this experience!`;
  }
  
  // Create and show endgame modal
  const endModal = document.createElement('div');
  endModal.className = 'headline-modal';
  endModal.innerHTML = `
    <div class="headline-content endgame-content">
      <h2>${title}</h2>
      <p>${message}</p>
      <div class="endgame-stats">
        <div><strong>Final Balance: $${finalBalance.toLocaleString()}</strong></div>
        <div><strong>Total Profit/Loss: ${profitSign}$${profitLoss.toLocaleString()}</strong></div>
      </div>
      <div class="endgame-actions">
        <button onclick="location.reload()" class="headline-btn">Play Again</button>
        <button onclick="showLeaderboard()" class="headline-btn secondary">View Leaderboard</button>
      </div>
    </div>
  `;
  document.body.appendChild(endModal);
  document.body.classList.add('modal-open');
}

// Show leaderboard function
function showLeaderboard() {
  // Close the endgame modal
  const endModals = document.querySelectorAll('.headline-modal');
  endModals.forEach(modal => {
    modal.remove();
  });
  document.body.classList.remove('modal-open');
  
  // Scroll to and highlight the leaderboard
  const leaderboardWrap = document.getElementById('leaderboardWrap');
  if (leaderboardWrap) {
    leaderboardWrap.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
    
    // Add a highlight effect
    leaderboardWrap.style.boxShadow = '0 0 20px rgba(0, 204, 102, 0.6)';
    leaderboardWrap.style.border = '2px solid #00cc66';
    leaderboardWrap.style.transition = 'all 0.3s ease';
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      leaderboardWrap.style.boxShadow = '0 4px 10px rgba(0,0,0,0.4)';
      leaderboardWrap.style.border = 'none';
    }, 3000);
  }
}

// Export functions for global access
window.initScenarioSystem = initScenarioSystem;
window.checkCrisisEvent = checkCrisisEvent;
window.applyMarketShock = applyMarketShock;
window.showEndgameMessage = showEndgameMessage;
