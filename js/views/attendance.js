import { getAttendance } from '../data.js';
import { fmtNum, fmtPct, escapeHtml, sortRows } from '../utils.js';

let sortKey = 'avg_attendance';
let sortDir = 'desc';

export async function renderAttendance(container) {
  const rows = await getAttendance();

  if (!rows.length) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon">🏟️</div>
        <h2>Lankomumo duomenų nėra</h2>
        <p>Reikia įkelti <code>data/attendance.json</code></p>
      </div>
    `;
    return;
  }

  const sorted = sortRows(rows, sortKey, sortDir);

  // Lygų grupavimas
  const leagues = [...new Set(rows.map(r => r.league))].filter(Boolean);

  container.innerHTML = `
    <div class="page-header">
      <h1>Lankomumas 25/26</h1>
      <p>${rows.length} komandų · ${leagues.length} lygų</p>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th data-sort="league">Lyga</th>
            <th data-sort="club">Klubas</th>
            <th data-sort="avg_attendance" class="num">Vid. žiūrovų</th>
            <th data-sort="capacity_primary" class="num">Talpa</th>
            <th data-sort="fill_pct" class="num">Užpildymas</th>
            <th data-sort="league_position" class="num">Vieta</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(r => {
            const cap = r.capacity_dual
              ? `${fmtNum(r.capacity_primary)} / ${fmtNum(r.capacity_secondary)} *`
              : fmtNum(r.capacity_primary);
            const fill = r.fill_pct != null
              ? `<span class="badge ${r.fill_pct > 0.85 ? 'success' : r.fill_pct > 0.6 ? '' : 'muted'}">${fmtPct(r.fill_pct)}</span>`
              : '—';
            return `
              <tr>
                <td class="muted" style="font-size:0.82rem">${escapeHtml((r.league || '').replace(/ lyga.*/i, ''))}</td>
                <td><span class="club-name">${escapeHtml(r.club)}</span></td>
                <td class="num">${fmtNum(r.avg_attendance)}</td>
                <td class="num">${cap}</td>
                <td class="num">${fill}</td>
                <td class="num">${r.league_position ?? '—'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
    <p class="muted" style="margin-top:12px;font-size:0.82rem">
      * Dvi arenos konfigūracijos. Užpildymas skaičiuojamas nuo mažesnės talpos.
    </p>
  `;

  container.querySelectorAll('th[data-sort]').forEach(th => {
    if (th.dataset.sort === sortKey) {
      th.classList.add('sorted');
      if (sortDir === 'asc') th.classList.add('asc');
    }
    th.addEventListener('click', () => {
      const k = th.dataset.sort;
      if (sortKey === k) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortKey = k; sortDir = 'desc'; }
      renderAttendance(container);
    });
  });
}
