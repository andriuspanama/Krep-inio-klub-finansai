import { getBudgets, clubsWithData, getAttendance } from '../data.js';
import { fmtMoney, fmtPct, escapeHtml, flag, getLeagueInfo, getParam, setParams } from '../utils.js';
import { lineChart, destroyAll } from '../charts.js';

let picks = ['Real Madrid', 'Barcelona', 'Valencia'];

export async function renderCompare(container) {
  const urlPicks = getParam('clubs');
  if (urlPicks) picks = urlPicks.split('|').slice(0, 4);

  const [rows2526, rows2627] = await Promise.all([
    getBudgets('2526'),
    getBudgets('2627'),
  ]);
  const allClubs = [...new Set([
    ...rows2526.map(r => r.club),
    ...rows2627.map(r => r.club),
  ])].filter(Boolean).sort();

  container.innerHTML = `
    <div class="page-header">
      <h1>Palyginimas</h1>
      <p>Pasirink 2–4 klubus</p>
    </div>

    <div class="compare-pickers">
      ${[0, 1, 2, 3].map(i => `
        <div class="toolbar-group">
          <label>Klubas ${i + 1}</label>
          <select data-pick="${i}">
            <option value="">—</option>
            ${allClubs.map(c => `<option value="${escapeHtml(c)}" ${picks[i] === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
          </select>
        </div>
      `).join('')}
    </div>

    <div id="compare-content"></div>
  `;

  container.querySelectorAll('[data-pick]').forEach(sel => {
    sel.addEventListener('change', () => {
      const i = +sel.dataset.pick;
      picks[i] = sel.value;
      picks = picks.filter(Boolean);
      while (p
