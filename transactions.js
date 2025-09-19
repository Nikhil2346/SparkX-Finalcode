// transactions.js
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('transaction-modal');
  const modalUser = document.getElementById('modal-user');
  const tableBody = document.querySelector('#transaction-table tbody');
  const modalClose = document.getElementById('modal-close');
  const leaderboard = document.querySelector('#leaderboard tbody');
  const leaderboardBtn = document.getElementById('leaderboardBtn');
  const leaderboardModal = document.getElementById('leaderboard-modal');
  const leaderboardModalClose = document.getElementById('leaderboard-modal-close');
  const modalLeaderboardBody = document.getElementById('modal-leaderboard-body');
  const resetLeaderboardModal = document.getElementById('reset-leaderboard-modal');

  function closeModal() {
    modal.classList.remove('show');
    tableBody.innerHTML = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Leaderboard modal functionality
leaderboardBtn.addEventListener('click', () => {
  // Get leaderboard data from localStorage or global variable
  const currentLeaderboard = (typeof window.leaderboard !== 'undefined') 
    ? window.leaderboard 
    : JSON.parse(localStorage.getItem('lb')||'{}');
  
  // Populate modal leaderboard
  modalLeaderboardBody.innerHTML = '';
  const arr = Object.entries(currentLeaderboard).sort((a,b)=>b[1]-a[1]);

  for(const [u,profitLoss] of arr){
    const tr = document.createElement('tr');
    const tdUser = document.createElement('td');
    const span = document.createElement('span');
    span.className = 'leader-user';
    span.dataset.username = u;
    span.textContent = u;
    span.style.cursor = 'pointer';
    span.style.color = 'var(--primary)';
    span.style.fontWeight = '600';
    tdUser.appendChild(span);

    const tdProfit = document.createElement('td');
    const profitClass = profitLoss >= 0 ? 'profit-positive' : 'profit-negative';
    const profitSign = profitLoss >= 0 ? '+' : '';
    tdProfit.className = profitClass;
    tdProfit.style.textAlign = 'right';
    tdProfit.textContent = `${profitSign}$${profitLoss.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;

    tr.appendChild(tdUser);
    tr.appendChild(tdProfit);
    modalLeaderboardBody.appendChild(tr);
  }
  
  leaderboardModal.classList.add('show');
  leaderboardModal.classList.remove('hidden');
});

leaderboardModalClose.addEventListener('click', () => {
  leaderboardModal.classList.remove('show');
  leaderboardModal.classList.add('hidden');
});

leaderboardModal.addEventListener('click', (e) => {
  if (e.target === leaderboardModal) {
    leaderboardModal.classList.remove('show');
    leaderboardModal.classList.add('hidden');
  }
});

resetLeaderboardModal.addEventListener('click', () => {
  if(confirm('Reset leaderboard?')){ 
    leaderboard = {}; 
    localStorage.removeItem('lb'); 
    modalLeaderboardBody.innerHTML = '';
    alert('Leaderboard reset!'); 
  }
});

  // Delegated click listener for leaderboard rows
  
  leaderboard.addEventListener('click', (e) => {
    const currentLeaderboard = (typeof leaderboard !== 'undefined') ? leaderboard : JSON.parse(localStorage.getItem('lb')||'{}');
    const row = e.target.closest('tr');
    if (!row) return;

    const username = row.querySelector('td').textContent.trim();
    const transactions = (typeof tradeHistory !== 'undefined') ? (tradeHistory[username] || []) : [];

    modalUser.textContent = username;
    tableBody.innerHTML = '';

    if (transactions.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="3" style="padding:8px; text-align:center;">No transactions found</td>`;
      tableBody.appendChild(tr);
    } else {
      // --- group by company + action ---
const grouped = {};

transactions.forEach(tx => {
  const company = tx.company;
  const action = tx.type.toUpperCase(); // BUY / SELL
  const qty = tx.qty;

  const key = `${company}_${action}`;
  if (!grouped[key]) {
    grouped[key] = { company, action, units: 0 };
  }
  grouped[key].units += qty;
});

// --- render grouped rows ---
Object.values(grouped).forEach(entry => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${entry.company}</td>
    <td style="text-align:right;">${entry.units}</td>
    <td style="color:${entry.action === 'BUY' ? 'limegreen' : 'red'};">${entry.action}</td>
  `;
  tableBody.appendChild(tr);
});

    }

    modal.classList.add('show');
  });
});
