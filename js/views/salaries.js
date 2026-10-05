import { getSalaries } from '../data.js';
import { fmtMoney, escapeHtml, sortRows, getParam, setParams } from '../utils.js';

let state = {
  search: '',
  country: '',
  team: '',
  role: '',
  sortKey: 'contract_value',
  sortDir: 'desc',
  limit: 100,
};

export async function renderSalaries(container) {
  state.search = getParam('q') || '';
  state.country = getParam('country') || '';
  state.team = getParam('team') || '';
  state.role = getParam('role') || '';

  const rows = await getSalaries();

  if (!rows.length) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">👤</div>
        <h2>Žaidėjų algų duomenų nėra</h2>
        <p>Reikia įkelti <code>data/salaries.json</code></p>
      </div>
    `;
    return;
  }

  const countries = [...new Set(rows.map(r => r.country).filter(Boolean))].sort();
  const teams = [...new Set(rows.map(r => r.team).filter(Boolean))].sort();

  let filtered = rows.filter(r => {
    if (state.search) {
      const q = state.search.toLowerCase();
      if (!r.name?.toLowerCase().includes(q) && !r.team?.toLowerCase().includes(q)) return false;
    }
    if (state.country && r.country !== state.country) return false;
    if (state.team && r.team !== state.team) return false;
    if (state.role && r.role !== state.role) return false;
    return true;
  });

  filtered = sortRows(filtered, state.sortKey, state.sortDir);

  const total = filtered.length;
  const shown = filtered.slice(0, state.limit);

  container.innerHTML = `
    <div class="page-header">
      <h1>Žaidėjų algos</h1>
      <p>${total} įrašų · rodoma ${shown.length}</p>
    </div>

    <div class="toolbar">
      <div class="toolbar-group" style="flex:1;min-width:200px">
        <label>Paieška</label>
        <input type="search" id="s-search" placeholder="Žaidėjas arba komanda…" value="${escapeHtml(state.search)}">
      </div>
      <div class="toolbar-group">
        <label>Šalis</label>
        <select id="s-country">
          <option value="">Visos</option>
          ${countries.map(c => `<option value="${escapeHtml(c)}" ${state.country === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
        </select>
      </div>
      <div class="toolbar-group">
        <label>Komanda</label>
        <select id="s-team">
          <option value="">Visos</option>
          ${teams.map(c => `<option value="${escapeHtml(c)}" ${state.team === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
        </select>
      </div>
      <div class="toolbar-group">
        <label>Vaidmuo</label>
        <select id="s-role">
          <option value="">Visi</option>
          <option value="Player" ${state.role === 'Player' ? 'selected' : ''}>Žaidėjas</option>
          <option value="Coach" ${state.role === 'Coach' ? 'selected' : ''}>Treneris</option>
        </select>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th data-sort="name">Vardas</th>
            <th data-sort="role">Vaidmuo</th>
            <th data-sort="team">Komanda</th>
            <th data-sort="country">Šalis</th>
            <th data-sort="season">Sezonas</th>
            <th data-sort="contract_value" class="num">Kontrakto vertė</th>
            <th data-sort="contract_months" class="num">Mėn.</th>
            <th data-sort="monthly_salary" class="num">Mėn. alga</th>
            <th>Šalt.</th>
          </tr>
        </thead>
        <tbody>
          ${shown.length ? shown.map(r => {
            const sources = (r.sources || []).slice(0, 3).map((u, i) =>
              `<a class="src-icon" href="${escapeHtml(u)}" target="_blank" rel="noopener" title="Šaltinis ${i+1}">${i+1}</a>`
            ).join('');
            return `
              <tr>
                <td><span class="club-name">${escapeHtml(r.name)}</span></td>
                <td><span class="badge ${r.role === 'Coach' ? 'warn' : ''}">${r.role === 'Coach' ? 'Treneris' : 'Žaidėjas'}</span></td>
                <td>${escapeHtml(r.team || '—')}</td>
                <td class="muted">${escapeHtml(r.country || '—')}</td>
                <td class="muted">${escapeHtml(r.season || '—')}</td>
                <td class="num">${fmtMoney(r.contract_value)}</td>
                <td class="num">${r.contract_months ?? '—'}</td>
                <td class="num">${fmtMoney(r.monthly_salary)}</td>
                <td><span class="src-links">${sources}</span></td>
              </tr>
            `;
          }).join('') : `<tr><td colspan="9" class="empty"><p>Nieko nerasta</p></td></tr>`}
        </tbody>
      </table>
    </div>

    ${shown.length < total ? `
      <div style="text-align:center;padding:20px">
        <button id="load-more" class="icon-btn" style="width:auto;padding:0 20px">Rodyti daugiau (${total - shown.length})</button>
      </div>
    ` : ''}
  `;

  const apply = () => {
    state.search = document.getElementById('s-search').value.trim();
    state.country = document.getElementById('s-country').value;
    state.team = document.getElementById('s-team').value;
    state.role = document.getElementById('s-role').value;
    state.limit = 100;
    setParams({ q: state.search, country: state.country, team: state.team, role: state.role });
    renderSalaries(container);
  };

  ['s-country', 's-team', 's-role'].forEach(id => {
    document.getElementById(id).addEventListener('change', apply);
  });
  let t;
  document.getElementById('s-search').addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(apply, 300);
  });

  document.getElementById('load-more')?.addEventListener('click', () => {
    state.limit += 100;
    renderSalaries(container);
  });

  container.querySelectorAll('th[data-sort]').forEach(th => {
    if (th.dataset.sort === state.sortKey) {
      th.classList.add('sorted');
      if (state.sortDir === 'asc') th.classList.add('asc');
    }
    th.addEventListener('click', () => {
      const k = th.dataset.sort;
      if (state.sortKey === k) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortKey = k; state.sortDir = 'desc'; }
      renderSalaries(container);
    });
  });
}
