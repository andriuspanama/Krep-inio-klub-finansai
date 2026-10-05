import { getBudgets, clubsWithData, leagueAverage } from '../data.js';
import { fmtMoney, fmtPct, fmtNum, fmtChange, escapeHtml, flag, getLeagueInfo } from '../utils.js';
import { barChart, doughnutChart, destroyAll } from '../charts.js';

export async function renderOverview(container) {
  container.innerHTML = `<div class="loading-screen"><div class="spinner"></div></div>`;
  const rows = await getBudgets('2526');

  if (!rows.length) {
    container.innerHTML = emptyState();
    return;
  }

  const withData = clubsWithData(rows);
  const total = withData.reduce((s, r) => s + (r.total_budget || 0), 0);
  const avgSalaryPct = leagueAverage(withData, 'salary_pct');
  const maxBudget = withData.reduce((m, r) => r.total_budget > (m?.total_budget || 0) ? r : m, null);
  const maxGrowth = withData
    .filter(r => r.budget_change != null && r.budget_change < 10 && r.budget_change > -0.9)
    .reduce((m, r) => r.budget_change > (m?.budget_change ?? -1) ? r : m, null);

  const top10 = [...withData]
    .filter(r => r.total_budget != null)
    .sort((a, b) => b.total_budget - a.total_budget)
    .slice(0, 10);

  const byLeague = new Map();
  for (const r of withData) {
    const info = getLeagueInfo(r.league);
    if (!byLeague.has(info.league)) byLeague.set(info.league, []);
    byLeague.get(info.league).push(r);
  }
  const leagueAvgs = [...byLeague.entries()].map(([name, list]) => ({
    name,
    avg: leagueAverage(list, 'total_budget'),
    count: list.length,
  })).sort((a, b) => b.avg - a.avg).slice(0, 8);

  container.innerHTML = `
    <div class="page-header fade-in">
      <h1>Apžvalga — sezonas 25/26</h1>
      <p>Bendri Europos krepšinio klubų finansiniai rodikliai</p>
    </div>

    <div class="stats-grid fade-in">
      <div class="stat-card accent">
        <div class="stat-label">Didžiausias biudžetas</div>
        <div class="stat-value">${maxBudget ? fmtMoney(maxBudget.total_budget) : '—'}</div>
        <div class="stat-sub">${maxBudget ? `${flag(maxBudget.nation)} ${escapeHtml(maxBudget.club)}` : ''}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">Vidutinis algų %</div>
        <div class="stat-value">${fmtPct(avgSalaryPct)}</div>
        <div class="stat-sub">nuo bendro biudžeto</div>
      </div>
      <div class="stat-card warn">
        <div class="stat-label">Didžiausias augimas</div>
        <div class="stat-value">${maxGrowth ? fmtChange(maxGrowth.budget_change) : '—'}</div>
        <div class="stat-sub">${maxGrowth ? escapeHtml(maxGrowth.club) : 'nėra duomenų'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Klubų su duomenimis</div>
        <div class="stat-value">${withData.length}</div>
        <div class="stat-sub">iš ${rows.length} iš viso</div>
      </div>
    </div>

    <h2 class="section-title">Top 10 klubų pagal biudžetą</h2>
    <div class="chart-card">
      <canvas id="chart-top10" height="120"></canvas>
    </div>

    <h2 class="section-title">Lygų vidurkiai (bendras biudžetas)</h2>
    <div class="chart-card">
      <canvas id="chart-league-avg" height="120"></canvas>
    </div>

    <h2 class="section-title">Top 10 lentelė</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Klubas</th>
            <th>Lyga</th>
            <th class="num">Biudžetas</th>
            <th class="num">Algoms</th>
            <th class="num">Algų %</th>
          </tr>
        </thead>
        <tbody>
          ${top10.map((r, i) => {
            const info = getLeagueInfo(r.league);
            return `
              <tr class="clickable" data-club="${escapeHtml(r.club)}">
                <td>${i + 1}</td>
                <td><span class="club-name">${flag(r.nation)} ${escapeHtml(r.club)}</span></td>
                <td class="muted">${escapeHtml(info.league)}</td>
                <td class="num">${fmtMoney(r.total_budget)}</td>
                <td class="num">${fmtMoney(r.salary_budget)}</td>
                <td class="num">${fmtPct(r.salary_pct)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  requestAnimationFrame(() => {
    barChart(
      'chart-top10',
      top10.map(r => r.club),
      top10.map(r => r.total_budget),
      { horizontal: true, colors: '#2563ebcc' }
    );
    barChart(
      'chart-league-avg',
      leagueAvgs.map(l => l.name),
      leagueAvgs.map(l => l.avg),
      { horizontal: true, colors: '#7c3aedcc' }
    );
  });

  container.querySelectorAll('tr[data-club]').forEach(tr => {
    tr.addEventListener('click', () => {
      location.hash = `#club/${encodeURIComponent(tr.dataset.club)}`;
    });
  });
}

function emptyState() {
  return `
    <div class="empty">
      <div class="empty-icon">📊</div>
      <h2>Duomenys dar nesugeneruoti</h2>
      <p>Reikia įkelti <code>data/*.json</code> failus į <code>data/</code> katalogą.</p>
    </div>
  `;
}
