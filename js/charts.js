// Grafikų piešimas su Chart.js

const instances = new Map();

const COLORS = {
  accent: '#2563eb',
  accentAlt: '#7c3aed',
  success: '#059669',
  warn: '#d97706',
  danger: '#dc2626',
  palette: [
    '#2563eb', '#7c3aed', '#0891b2', '#059669',
    '#d97706', '#dc2626', '#db2777', '#65a30d',
  ],
};

export function destroyChart(id) {
  if (instances.has(id)) {
    instances.get(id).destroy();
    instances.delete(id);
  }
}

export function destroyAll() {
  for (const [id] of instances) destroyChart(id);
}

function isDark() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function textColor() {
  return isDark() ? '#e6edf6' : '#0f172a';
}

function mutedColor() {
  return isDark() ? '#94a3b8' : '#64748b';
}

function gridColor() {
  return isDark() ? 'rgba(148,163,184,.1)' : 'rgba(148,163,184,.2)';
}

function fmtShort(v) {
  if (v == null || isNaN(v)) return '—';
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return (v / 1_000_000).toFixed(1).replace('.', ',') + 'M€';
  if (abs >= 1_000) return Math.round(v / 1000) + 'k€';
  return String(Math.round(v));
}

function baseOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: {
        labels: {
          color: textColor(),
          font: { family: 'Inter', size: 12 },
          padding: 12,
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: isDark() ? '#1f2a3f' : '#0f172a',
        titleColor: '#fff',
        bodyColor: '#e6edf6',
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: 'Inter', size: 13, weight: '600' },
        bodyFont: { family: 'Inter', size: 13 },
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y ?? ctx.parsed;
            if (typeof val === 'number') {
              return ` ${ctx.dataset.label || ctx.label}: ${fmtShort(val)}`;
            }
            return ` ${ctx.dataset.label || ctx.label}: ${val}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: mutedColor(), font: { family: 'Inter', size: 11 } },
        grid: { color: gridColor(), drawBorder: false },
      },
      y: {
        ticks: {
          color: mutedColor(),
          font: { family: 'Inter', size: 11 },
          callback: (v) => fmtShort(v),
        },
        grid: { color: gridColor(), drawBorder: false },
      },
    },
  };
}

export function barChart(id, labels, values, opts = {}) {
  destroyChart(id);
  const el = document.getElementById(id);
  if (!el) return;

  const base = baseOptions();
  const cfg = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: opts.label || 'Biudžetas',
        data: values,
        backgroundColor: opts.colors || COLORS.accent + 'cc',
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      ...base,
      indexAxis: opts.horizontal ? 'y' : 'x',
      plugins: {
        ...base.plugins,
        legend: { display: opts.showLegend ?? false, ...base.plugins.legend },
      },
    },
  };
  instances.set(id, new Chart(el, cfg));
  return instances.get(id);
}

export function lineChart(id, labels, datasets, opts = {}) {
  destroyChart(id);
  const el = document.getElementById(id);
  if (!el) return;

  const base = baseOptions();
  const cfg = {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map((d, i) => ({
        label: d.label,
        data: d.values,
        borderColor: d.color || COLORS.palette[i % COLORS.palette.length],
        backgroundColor: (d.color || COLORS.palette[i % COLORS.palette.length]) + '22',
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: d.fill ?? false,
      })),
    },
    options: base,
  };
  instances.set(id, new Chart(el, cfg));
  return instances.get(id);
}

export function doughnutChart(id, labels, values, opts = {}) {
  destroyChart(id);
  const el = document.getElementById(id);
  if (!el) return;

  const cfg = {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: COLORS.palette,
        borderWidth: 2,
        borderColor: isDark() ? '#151c2c' : '#fff',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor(),
            font: { family: 'Inter', size: 12 },
            padding: 10,
            boxWidth: 12,
          },
        },
        tooltip: {
          backgroundColor: isDark() ? '#1f2a3f' : '#0f172a',
          titleColor: '#fff',
          bodyColor: '#e6edf6',
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((s, v) => s + v, 0);
              const pct = ((ctx.parsed / total) * 100).toFixed(1);
              return ` ${ctx.label}: ${fmtShort(ctx.parsed)} (${pct}%)`;
            },
          },
        },
      },
      cutout: '62%',
    },
  };
  instances.set(id, new Chart(el, cfg));
  return instances.get(id);
}

export function refreshThemes() {
  for (const [id, chart] of instances) {
    const opts = chart.options;
    if (opts.plugins?.legend?.labels) opts.plugins.legend.labels.color = textColor();
    if (opts.plugins?.tooltip) opts.plugins.tooltip.backgroundColor = isDark() ? '#1f2a3f' : '#0f172a';
    if (opts.scales?.x?.ticks) opts.scales.x.ticks.color = mutedColor();
    if (opts.scales?.y?.ticks) opts.scales.y.ticks.color = mutedColor();
    if (opts.scales?.x?.grid) opts.scales.x.grid.color = gridColor();
    if (opts.scales?.y?.grid) opts.scales.y.grid.color = gridColor();
    chart.update('none');
  }
}
