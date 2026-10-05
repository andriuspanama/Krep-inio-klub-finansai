// Bendros pagalbinės funkcijos

export const fmtMoney = (v, opts = {}) => {
  if (v == null || isNaN(v)) return '—';
  const abs = Math.abs(v);
  const sign = v < 0 ? '−' : '';
  if (abs >= 1_000_000) {
    const n = (abs / 1_000_000).toFixed(opts.decimals ?? 1).replace('.', ',');
    return `${sign}${n} mln. €`;
  }
  if (abs >= 1_000) {
    const n = Math.round(abs / 1000);
    return `${sign}${n} tūkst. €`;
  }
  return `${sign}${Math.round(abs)} €`;
};

export const fmtPct = (v, digits = 1) => {
  if (v == null || isNaN(v)) return '—';
  return (v * 100).toFixed(digits).replace('.', ',') + ' %';
};

export const fmtNum = (v) => {
  if (v == null || isNaN(v)) return '—';
  return new Intl.NumberFormat('lt-LT').format(Math.round(v));
};

export const fmtChange = (v) => {
  if (v == null || isNaN(v)) return '—';
  const sign = v > 0 ? '+' : v < 0 ? '−' : '';
  return sign + (Math.abs(v) * 100).toFixed(1).replace('.', ',') + ' %';
};

export const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Flag emoji iš šalies
const FLAGS = {
  'France': '🇫🇷', 'Germany': '🇩🇪', 'Spain': '🇪🇸', 'Italy': '🇮🇹',
  'Lithuania': '🇱🇹', 'Latvia': '🇱🇻', 'Estonia': '🇪🇪', 'Finland': '🇫🇮',
  'Greece': '🇬🇷', 'Turkey': '🇹🇷', 'Serbia': '🇷🇸', 'Croatia': '🇭🇷',
  'Slovenia': '🇸🇮', 'Montenegro': '🇲🇪', 'Bosnia and Herzegovina': '🇧🇦',
  'North Macedonia': '🇲🇰', 'Austria': '🇦🇹', 'Israel': '🇮🇱',
  'Australia': '🇦🇺', 'Japan': '🇯🇵', 'Poland': '🇵🇱', 'Czech Republic': '🇨🇿',
  'Hungary': '🇭🇺', 'Slovakia': '🇸🇰', 'Romania': '🇷🇴', 'Portugal': '🇵🇹',
  'Belgium': '🇧🇪', 'Denmark': '🇩🇰', 'United Kingdom': '🇬🇧',
  'United Arab Emirates': '🇦🇪',
};

export const flag = (nation) => FLAGS[nation] || '🏳️';

// Konfigūracija: lygos → grupė
export const LEAGUE_GROUPS = {
  'French league': { id: 'west-eu', label: 'Vakarų Europa', league: 'Prancūzija (Betclic Elite)' },
  'German league': { id: 'west-eu', label: 'Vakarų Europa', league: 'Vokietija (easyCredit BBL)' },
  'Spanish league': { id: 'west-eu', label: 'Vakarų Europa', league: 'Ispanija (Liga Endesa)' },
  'Italian league': { id: 'west-eu', label: 'Vakarų Europa', league: 'Italija (Lega A)' },
  'Lithuanian league': { id: 'baltic', label: 'Baltijos ir Šiaurės', league: 'Lietuva (LKL)' },
  'Greek league': { id: 'se-eu', label: 'Pietryčių Europa', league: 'Graikija (GBL)' },
  'Turkish league': { id: 'se-eu', label: 'Pietryčių Europa', league: 'Turkija (Super Ligi)' },
  'ABA league': { id: 'se-eu', label: 'Pietryčių Europa', league: 'ABA lyga' },
  'Israeli league': { id: 'world', label: 'Visas pasaulis', league: 'Izraelis (Winner)' },
  'Australian league': { id: 'world', label: 'Visas pasaulis', league: 'Australija (NBL)' },
  'Japan league': { id: 'world', label: 'Visas pasaulis', league: 'Japonija (B.League)' },
  'Other clubs': { id: 'other', label: 'Kiti klubai', league: 'Kiti klubai' },
};

export const GROUP_LABELS = {
  'west-eu': 'Vakarų Europa',
  'baltic': 'Baltijos ir Šiaurės',
  'se-eu': 'Pietryčių Europa',
  'world': 'Visas pasaulis',
  'other': 'Kiti klubai',
};

export const GROUP_ORDER = ['west-eu', 'baltic', 'se-eu', 'world', 'other'];

export function getLeagueInfo(leagueTitle) {
  if (!leagueTitle) return { groupId: 'other', groupLabel: 'Kiti', league: 'Nežinoma' };
  for (const [key, val] of Object.entries(LEAGUE_GROUPS)) {
    if (leagueTitle.toLowerCase().includes(key.toLowerCase())) {
      return { groupId: val.id, groupLabel: val.label, league: val.league };
    }
  }
  return { groupId: 'other', groupLabel: 'Kiti', league: leagueTitle };
}

// URL params
export function getParam(key) {
  return new URLSearchParams(location.search).get(key);
}

export function setParams(obj) {
  const url = new URL(location.href);
  for (const [k, v] of Object.entries(obj)) {
    if (v == null || v === '') url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  history.replaceState(null, '', url);
}

// Sort
export function sortRows(rows, key, dir = 'asc') {
  const mult = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = a[key], bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * mult;
    return String(av).localeCompare(String(bv), 'lt') * mult;
  });
}

// Debounce
export function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
