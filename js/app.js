// Pagrindinis aplikacijos failas

import { destroyAll, refreshThemes } from './charts.js';
import { renderOverview } from './views/overview.js';
import { renderBudgets } from './views/budgets.js';
import { renderClub } from './views/club.js';
import { renderCompare } from './views/compare.js';
import { renderAttendance } from './views/attendance.js';
import { renderSalaries } from './views/salaries.js';
import { renderTaxes } from './views/taxes.js';

const viewEl = document.getElementById('view');
const menuToggle = document.getElementById('menu-toggle');
const sidenav = document.getElementById('sidenav');
const themeToggle = document.getElementById('theme-toggle');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');

// ===== Tema =====
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  refreshThemes();
});

// ===== Meniu =====
menuToggle.addEventListener('click', () => {
  sidenav.classList.toggle('open');
});

sidenav.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    sidenav.classList.remove('open');
  }
});

// ===== Modalas =====
function openModal(html) {
  modalBody.innerHTML = html;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('open'));
}

function closeModal() {
  modal.classList.remove('open');
  setTimeout(() => { modal.hidden = true; modalBody.innerHTML = ''; }, 200);
}

modal.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-close') || e.target.closest('[data-close]')) {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

// ===== Routing =====
const VIEWS = {
  overview: renderOverview,
  budgets: renderBudgets,
  compare: renderCompare,
  attendance: renderAttendance,
  salaries: renderSalaries,
  taxes: renderTaxes,
};

async function route() {
  destroyAll();
  const hash = location.hash.slice(1) || 'overview';
  const parts = hash.split('/');
  const view = parts[0];

  // Aktyvus meniu punktas
  document.querySelectorAll('.nav-item').forEach(a => {
    a.classList.toggle('active', a.dataset.view === view || (view === 'club' && a.dataset.view === 'budgets'));
  });

  // Scroll į viršų
  window.scrollTo({ top: 0, behavior: 'instant' });

  try {
    if (view === 'club' && parts[1]) {
      await renderClub(viewEl, decodeURIComponent(parts[1]));
    } else if (VIEWS[view]) {
      await VIEWS[view](viewEl);
    } else {
      await renderOverview(viewEl);
    }
  } catch (e) {
    console.error('Route error:', e);
    viewEl.innerHTML = `
      <div class="empty">
        <div class="empty-icon">⚠️</div>
        <h2>Klaida</h2>
        <p>${e.message}</p>
        <a href="#overview">Grįžti į pradžią</a>
      </div>
    `;
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  route();
});

// Jei jau užkrauta
if (document.readyState !== 'loading') {
  initTheme();
  route();
}
