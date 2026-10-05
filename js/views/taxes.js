import { getTaxes } from '../data.js';
import { escapeHtml } from '../utils.js';

export async function renderTaxes(container) {
  const rows = await getTaxes();

  const rates = [
    { period: '2005', rate: 0.81 },
    { period: '2007', rate: 0.72 },
    { period: '2008', rate: 0.65 },
    { period: '2009', rate: 0.70 },
    { period: '2010', rate: 0.80 },
    { period: '2011', rate: 0.70 },
    { period: '2012', rate: 0.80 },
    { period: '2013', rate: 0.75 },
    { period: '2014', rate: 0.75 },
    { period: '2015', rate: 0.90 },
    { period: '2016', rate: 0.90 },
    { period: '2017', rate: 0.86 },
    { period: '2018', rate: 0.85 },
    { period: '2019', rate: 0.90 },
    { period: '2020', rate: 0.87 },
    { period: '2021', rate: 0.85 },
    { period: '2022', rate: 1.00 },
    { period: '2023', rate: 0.90 },
    { period: '2024', rate: 0.92 },
    { period: '2025', rate: 0.85 },
    { period: '2026', rate: 0.88 },
  ];

  container.innerHTML = `
    <div class="page-header">
      <h1>Mokesčiai ir kursai</h1>
      <p>Šalių mokesčių sistemos ir USD → EUR kursai</p>
    </div>

    <h2 class="section-title">Šalių mokesčių apžvalga</h2>
    ${rows.length ? `
      <div class="card" style="display:grid;gap:16px">
        ${rows.map(r => `
          <div style="padding-bottom:16px;border-bottom:1px solid var(--border)">
            <h3 style="font-size:1rem;margin-bottom:6px">
              ${escapeHtml(r.country)} <span class="badge">${escapeHtml(r.season || '')}</span>
            </h3>
            <p style="color:var(--text-muted);font-size:0.9rem;line-height:1.6">${escapeHtml(r.description)}</p>
            ${r.source ? `<p style="margin-top:8px"><a href="${escapeHtml(r.source)}" target="_blank" rel="noopener" style="font-size:0.82rem">Šaltinis</a></p>` : ''}
          </div>
        `).join('')}
      </div>
    ` : `<div class="empty"><p>Mokesčių duomenų nėra</p></div>`}

    <h2 class="section-title">USD → EUR kursai (vasaros)</h2>
    <div class="table-wrap">
      <table style="min-width:auto">
        <thead>
          <tr>
            <th>Metai</th>
            <th class="num">1 USD = EUR</th>
          </tr>
        </thead>
        <tbody>
          ${rates.map(r => `
            <tr>
              <td>${r.period}</td>
              <td class="num">${r.rate.toFixed(2).replace('.', ',')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
