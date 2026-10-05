import { getBudgets } from '../data.js';
import { fmtMoney, fmtPct, escapeHtml, flag, getLeagueInfo, getParam, setParams } from '../utils.js';
import { barChart } from '../charts.js';

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
      <p>Pasirink 2–4 klubus ir palygink jų finansus</p>
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
      while (picks.length < 4) picks.push('');
      renderCompareContent(rows2526, rows2627, container);
      setParams({ clubs: picks.filter(Boolean).join('|') });
    });
  });

  renderCompareContent(rows2526, rows2627, container);
}

function renderCompareContent(rows2526, rows2627, container) {
  const content = container.querySelector('#compare-content');
  const chosen = picks.filter(Boolean);

  if (chosen.length < 2) {
    content.innerHTML = `<div class="empty"><div class="empty-icon">⚖️</div><p>Pasirink bent 2 klubus</p></div>`;
    return;
  }

  const clubs = chosen.map(name => {
    const a = rows2526.find(r => r.club === name);
    const b = rows2627.find(r => r.club === name);
    return { name, a, b, base: a || b };
  }).filter(c => c.base);

  content.innerHTML = `
    <h2 class="section-title">Sezonas 25/26</h2>
    <div class="compare-grid">
      ${clubs.map(c => compareCard(c, 'a')).join('')}
    </div>

    <div class="chart-card">
      <h3>Biudžetų palyginimas (25/26)</h3>
      <canvas id="cmp-chart-1" height="100"></canvas>
    </div>

    <div class="chart-card">
      <h3>Algų biudžetų palyginimas (25/26)</h3>
      <canvas id="cmp-chart-2" height="100"></canvas>
    </div>

    <h2 class="section-title">Detali lentelė</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Klubas</th>
            <th class="num">Biudžetas 25/26</th>
            <th class="num">Algoms 25/26</th>
            <th class="num">Algų %</th>
            <th class="num">Biudžetas 26/27</th>
            <th class="num">Pokytis</th>
          </tr>
        </thead>
        <tbody>
          ${clubs.map(c => {
            const a = c.a, b = c.b;
            const change = (a?.total_budget && b?.total_budget)
              ? (b.total_budget - a.total_budget) / a.total_budget
              : null;
            const changeCls = change == null ? '' : change > 0 ? 'pos' : change < 0 ? 'neg' : '';
            return `
              <tr>
                <td><span class="club-name">${flag(c.base.nation)} ${escapeHtml(c.name)}</span></td>
                <td class="num">${fmtMoney(a?.total_budget)}</td>
                <td class="num">${fmtMoney(a?.salary_budget)}</td>
                <td class="num">${fmtPct(a?.salary_pct)}</td>
                <td class="num">${fmtMoney(b?.total_budget)}</td>
                <td class="num ${changeCls}">${change == null ? '—' : (change > 0 ? '+' : '') + (change * 100).toFixed(1).replace('.', ',') + ' %'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  requestAnimationFrame(() => {
    const labels = clubs.map(c => c.name);
    barChart('cmp-chart-1', labels, clubs.map(c => c.a?.total_budget ?? 0), { label: 'Biudžetas' });
    barChart('cmp-chart-2', labels, clubs.map(c => c.a?.salary_budget ?? 0), { label: 'Algoms', colors: '#7c3aedcc' });
  });
}

function compareCard(c, key) {
  const s = c[key];
  if (!s) return `<div class="compare-card"><h4>${escapeHtml(c.name)}</h4><p class="muted">Nėra duomenų</p></div>`;
  const info = getLeagueInfo(s.league);
  return `
    <div class="compare-card">
      <h4>${flag(s.nation)} ${escapeHtml(c.name)}</h4>
      <div class="sub">${escapeHtml(info.league)}</div>
      <div class="value">${fmtMoney(s.total_budget)}</div>
      <div class="sub" style="margin-top:8px">Algoms: ${fmtMoney(s.salary_budget)} (${fmtPct(s.salary_pct)})</div>
    </div>
  `;
}
