// Duomenų užkrovimas ir kešavimas

const CACHE = new Map();

export async function loadJSON(path) {
  if (CACHE.has(path)) return CACHE.get(path);
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    CACHE.set(path, data);
    return data;
  } catch (e) {
    console.warn(`Nepavyko įkelti ${path}:`, e.message);
    return [];
  }
}

export const SEASONS = {
  '2526': { id: '2526', label: '25/26', file: 'data/budgets_2526.json' },
  '2627': { id: '2627', label: '26/27', file: 'data/budgets_2627.json' },
};

export async function getBudgets(season) {
  const s = SEASONS[season];
  if (!s) return [];
  return loadJSON(s.file);
}

export async function getAttendance() {
  return loadJSON('data/attendance.json');
}

export async function getSalaries() {
  return loadJSON('data/salaries.json');
}

export async function getTaxes() {
  return loadJSON('data/taxes.json');
}

// Pagalbinės funkcijos
export function clubsWithData(rows) {
  return rows.filter(r => r.total_budget != null && r.club);
}

export function leagueAverage(rows, field) {
  const valid = rows.filter(r => r[field] != null && !isNaN(r[field]));
  if (!valid.length) return null;
  return valid.reduce((s, r) => s + r[field], 0) / valid.length;
}

export function groupBy(rows, keyFn) {
  const out = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (!out.has(k)) out.set(k, []);
    out.get(k).push(r);
  }
  return out;
}

// Sujungia 25/26 ir 26/27 duomenis klubui
export function mergeClub(rows2526, rows2627, clubName) {
  const a = rows2526.find(r => r.club === clubName) || null;
  const b = rows2627.find(r => r.club === clubName) || null;
  return { s2526: a, s2627: b };
}
