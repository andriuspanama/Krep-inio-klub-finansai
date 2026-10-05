import { getBudgets, mergeClub } from '../data.js';
import { fmtMoney, fmtPct, fmtChange, escapeHtml, flag, getLeagueInfo } from '../utils.js';

export async function renderClub(container, clubName) {
  container.innerHTML = `<div class="loading-screen"><div class="spinner"></div></div>`;
  const [rows2526, rows2627] = await Promise.all([
    getBudgets('2526'),
    getBudgets('2627'),
  ]);

  const { s2526, s2627 } = mergeClub(rows2526, rows2627, clubName);

  if (!s2526 && !s2627) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">❓</div>
        <h2>Klubas nerastas</h2>
        <p>${escapeHtml(clubName)}</p>
        <a href="#budgets">← Grįžti į biudžetus</a>
      </div>
    `;
    return;
  }

  const base = s2526 || s2627;
  const info = getLeagueInfo(base.league);
  const nation = base.nation;

  container.innerHTML = `
    <div class="page-header">
      <a href="#budgets" style="font-size:0.85rem">← Visi klubai</a>
      <h1 style="margin-top:8px">${flag(nation)} ${escapeHtml(clubName)}</h1>
      <p>${escapeHtml(info.league)} · ${escapeHtml(nation || '')}</p>
    </div>

    <div class="season-compare">
      <div class="season-box">
        <div class="label">Sezonas 25/26</div>
        ${s2526 ? renderSeasonBox(s2526) : '<p class="muted">Nėra duomenų</p>'}
      </div>
      <div class="season-box">
        <div class="label">Sezonas 26/27</div>
        ${s2627 ? renderSeasonBox(s2627) : '<p class="muted">Duomenys dar nepaskelbti</p>'}
      </div>
    </div>

    ${renderChanges(s2526, s2627)}

    ${(s2526?.sources?.length || s2627?.sources?.length) ? `
      <h2 class="section-title">Šaltiniai</h2>
      <div class="card">
        <ul style="list-style:none;display:flex;flex-direction:column;gap:8px">
          ${[...(s2526?.sources || []), ...(s2627?.sources || [])].map(u =>
            `<li><a href="${escapeHtml(u)}" target="_blank" rel="noopener" style="font-size:0.88rem">${escapeHtml(u)}</a></li>`
          ).join('')}
        </ul>
      </div>
    ` : ''}
  `;
}

function renderSeasonBox(s) {
  return `
    <div class="row"><span>Bendras biudžetas</span><span>${fmtMoney(s.total_budget)}</span></div>
    <div class="row"><span>Algų biudžetas</span><span>${fmtMoney(s.salary_budget)}</span></div>
    <div class="row"><span>Algų dalis</span><span>${fmtPct(s.salary_pct)}</span></div>
    <div class="row"><span>Pokytis</span><span>${s.budget_change != null ? fmtChange(s.budget_change) : '—'}</span></div>
    <div class="row"><span>Vieta lygoje</span><span>${s.league_position ?? '—'}</span></div>
    <div class="row"><span>Europa</span><span>${escapeHtml(s.europe || '—')}</span></div>
  `;
}

function renderChanges(a, b) {
  if (!a || !b || a.total_budget == null || b.total_budget == null) return '';
  const diff = b.total_budget - a.total_budget;
  const pct = a.total_budget > 0 ? diff / a.total_budget : 0;
  const cls = diff > 0 ? 'pos' : diff < 0 ? 'neg' : '';
  return `
    <h2 class="section-title">Pokytis tarp sezonų</h2>
    <div class="card">
      <div class="kv-list">
        <div class="kv-item"><span class="k">Biudžeto pokytis</span><span class="v ${cls}">${diff >= 0 ? '+' : ''}${fmtMoney(diff)}</span></div>
        <div class="kv-item"><span class="k">Pokytis %</span><span class="v ${cls}">${fmtChange(pct)}</span></div>
      </div>
    </div>
  `;
}
