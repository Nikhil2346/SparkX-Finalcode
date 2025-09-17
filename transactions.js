// transactions.js
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('transaction-modal');
  const modalUser = document.getElementById('modal-user');
  const tableBody = document.querySelector('#transaction-table tbody');
  const modalClose = document.getElementById('modal-close');
  const leaderboard = document.querySelector('#leaderboard tbody');

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

  // Delegated click listener for leaderboard rows
  leaderboard.addEventListener('click', (e) => {
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
