import { getBudgets, clubsWithData, SEASONS } from '../data.js';
import { fmtMoney, fmtPct, fmtChange, escapeHtml, flag, getLeagueInfo, GROUP_LABELS, GROUP_ORDER, sortRows, getParam, setParams } from '../utils.js';

let state = {
  season: '2526',
  search: '',
  group: '',
  league: '',
  minBudget: '',
  maxBudget: '',
  europe: '',
  sortKey: 'total_budget',
  sortDir: 'desc',
};

export async function renderBudgets(container) {
  state.season = getParam('season') || '2526';
  state.search = getParam('q') || '';
  state.group = getParam('group') || '';
  state.league = getParam('league') || '';
  state.minBudget = getParam('min') || '';
  state.maxBudget = getParam('max') || '';
  state.europe = getParam('europe') || '';
  state.sortKey = getParam('sort') || 'total_budget';
  state.sortDir = getParam('dir') || 'desc';

  const allRows = await getBudgets(state.season);
  const withData = clubsWithData(allRows);

  const leagues = [...new Set(withData.map(r => getLeagueInfo(r.league).league))].sort();

  let filtered = withData.filter(r => {
    if (state.search) {
      const q = state.search.toLowerCase();
      if (!r.club.toLowerCase().includes(q) && !(r.nation || '').toLowerCase().includes(q)) return false;
    }
    if (state.group) {
      const info = getLeagueInfo(r.league);
      if (info.groupId !== state.group) return false;
    }
    if (state.league) {
      const info = getLeagueInfo(r.league);
      if (info.league !== state.league) return false;
    }
    if (state.minBudget && (r.total_budget == null || r.total_budget < +state.minBudget)) return false;
    if (state.maxBudget && (r.total_budget == null || r.total_budget > +state.maxBudget)) return false;
    if (state.europe === 'yes' && (!r.europe || r.europe === '-')) return false;
    if (state.europe === 'no' && r.europe && r.europe !== '-') return false;
    return true;
  });

  filtered = sortRows(filtered, state.sortKey, state.sortDir);

  container.innerHTML = `
    <div class="page-header fade-in">
      <h1>Biudžetai</h1>
      <p>${filtered.length} klubų${state.search ? ` (iš ${withData.length})` : ''}</p>
    </div>

    <div class="toolbar">
      <div class="segmented" id="season-switch">
        ${Object.values(SEASONS).map(s => `
          <button data-season="${s.id}" class="${state.season === s.id ? 'active' : ''}">${s.label}</button>
        `).join('')}
      </div>
      <div class="toolbar-group" style="flex:1;min-width:200px">
        <label>Paieška</label>
        <input type="search" id="f-search" placeholder="Klubas arba šalis…" value="${escapeHtml(state.search)}">
      </div>
      <div class="toolbar-group">
        <label>Grupė</label>
        <select id="f-group">
          <option value="">Visos</option>
          ${GROUP_ORDER.map(g => `<option value="${g}" ${state.group === g ? 'selected' : ''}>${GROUP_LABELS[g]}</option>`).join('')}
        </select>
      </div>
      <div class="toolbar-group">
        <label>Lyga</label>
        <select id="f-league">
          <option value="">Visos</option>
          ${leagues.map(l => `<option value="${escapeHtml(l)}" ${state.league === l ? 'selected' : ''}>${escapeHtml(l)}</option>`).join('')}
        </select>
      </div>
      <div class="toolbar-group">
        <label>Min €</label>
        <input type="number" id="f-min" placeholder="0" value="${escapeHtml(state.minBudget)}" style="width:110px">
      </div>
      <div class="toolbar-group">
        <label>Max €</label>
        <input type="number" id="f-max" placeholder="∞" value="${escapeHtml(state.maxBudget)}" style="width:110px">
      </div>
      <div class="toolbar-group">
        <label>Europa</label>
        <select id="f-europe">
          <option value="">Visi</option>
          <option value="yes" ${state.europe === 'yes' ? 'selected' : ''}>Tik su</option>
          <option value="no" ${state.europe === 'no' ? 'selected' : ''}>Tik be</option>
        </select>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th data-sort="club">Klubas</th>
            <th data-sort="league">Lyga</th>
            <th data-sort="total_budget" class="num">Biudžetas</th>
            <th data-sort="salary_budget" class="num">Algoms</th>
            <th data-sort="salary_pct" class="num">Algų %</th>
            <th data-sort="budget_change" class="num">Pokytis</th>
            <th data-sort="league_position" class="num">Vieta</th>
            <th>Europa</th>
            <th>Šalt.</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.length ? filtered.map(r => rowHtml(r)).join('') : `
            <tr><td colspan="9" class="empty"><p>Nieko nerasta</p></td></tr>
          `}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll('th[data-sort]').forEach(th => {
    if (th.dataset.sort === state.sortKey) {
      th.classList.add('sorted');
      if (state.sortDir === 'asc') th.classList.add('asc');
    }
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (state.sortKey === key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortKey = key; state.sortDir = 'desc'; }
      updateUrl();
      renderBudgets(container);
    });
  });

  container.querySelectorAll('#season-switch button').forEach(btn => {
    btn.addEventListener('click', () => {
      state.season = btn.dataset.season;
      updateUrl();
      renderBudgets(container);
    });
  });

  const applyFilters = () => {
    state.search = document.getElementById('f-search').value.trim();
    state.group = document.getElementById('f-group').value;
    state.league = document.getElementById('f-league').value;
    state.minBudget = document.getElementById('f-min').value;
    state.maxBudget = document.getElementById('f-max').value;
    state.europe = document.getElementById('f-europe').value;
    updateUrl();
    renderBudgets(container);
  };

  ['f-group', 'f-league', 'f-europe'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyFilters);
  });
  ['f-min', 'f-max'].forEach(id => {
    document.getElementById(id).addEventListener('change', applyFilters);
  });
  let searchTimer;
  document.getElementById('f-search').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 300);
  });

  container.querySelectorAll('tr[data-club]').forEach(tr => {
    tr.addEventListener('click', () => {
      location.hash = `#club/${encodeURIComponent(tr.dataset.club)}`;
    });
  });
}

function rowHtml(r) {
  const info = getLeagueInfo(r.league);
  const change = r.budget_change;
  const changeClass = change == null ? '' : (change > 0 ? 'pos' : change < 0 ? 'neg' : '');
  const changeStr = change == null ? '—' : fmtChange(change);
  const europe = r.europe && r.europe !== '-' ? '<span class="badge success">✓</span>' : '<span class="badge muted">—</span>';
  const sources = (r.sources || []).slice(0, 3).map((u, i) =>
    `<a class="src-icon" href="${escapeHtml(u)}" target="_blank" rel="noopener" title="Šaltinis ${i+1}">${i+1}</a>`
  ).join('');
  const noteTip = r.note ? `<span class="note-tip" title="${escapeHtml(r.note)}">ⓘ</span>` : '';

  return `
    <tr class="clickable" data-club="${escapeHtml(r.club)}">
      <td><span class="club-name">${flag(r.nation)} ${escapeHtml(r.club)}</span>${noteTip}</td>
      <td class="muted">${escapeHtml(info.league)}</td>
      <td class="num">${fmtMoney(r.total_budget)}</td>
      <td class="num">${fmtMoney(r.salary_budget)}</td>
      <td class="num">${fmtPct(r.salary_pct)}</td>
      <td class="num ${changeClass}">${changeStr}</td>
      <td class="num">${r.league_position ?? '—'}</td>
      <td>${europe}</td>
      <td><span class="src-links">${sources}</span></td>
    </tr>
  `;
}

function updateUrl() {
  setParams({
    season: state.season,
    q: state.search,
    group: state.group,
    league: state.league,
    min: state.minBudget,
    max: state.maxBudget,
    europe: state.europe,
    sort: state.sortKey,
    dir: state.sortDir,
  });
}
