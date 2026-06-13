// ============================================================
// Ticker Event Workbench — Application Logic
// Self-contained prototype · synthetic data only · no API calls
// ============================================================

// --- State ---
let activeTab = 'overview';
let railCollapsed = false;
let drawerCollapsed = true;
let historyExpanded = false;
let activeSort = { col: 'date', dir: 'desc' };
let chartInstances = {};
let activeN = 21;

// --- Chart.js defaults ---
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.color = '#4A5560';

const C = {
  copper:       '#BB7333',
  copperAlpha:  'rgba(187,115,51,0.12)',
  copperLight:  'rgba(187,115,51,0)',
  blue:         '#3A7CA5',
  blueAlpha:    'rgba(58,124,165,0.15)',
  green:        '#2F8F63',
  red:          '#C24443',
  teal:         '#0F4D4A',
  grid:         'rgba(74,85,96,0.08)',
  text2:        '#4A5560',
  text3:        '#8A9299',
};

// ============================================================
// BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  renderComparableList();
  renderStatements();
  renderDrawerAnalogues();
  renderMiniEventTable();
  renderFullEventTable(eventHistory);
  renderPriceSummaryTable();
  renderIVSummaryTable();
  renderMethodologyTab();
  initAllCharts();
  startCountdown();
});

// ============================================================
// TAB SWITCHING
// ============================================================
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  const btn = document.querySelector(`[data-tab="${tab}"]`);
  if (btn) btn.classList.add('active');
  const panel = document.getElementById(`tab-${tab}`);
  if (panel) panel.classList.add('active');

  activeTab = tab;

  // Lazy-init charts for newly-visible tabs
  requestAnimationFrame(() => {
    if (tab === 'price-impact') {
      initPriceImpactCharts();
    } else if (tab === 'implied-vol') {
      initIVCharts();
    }
  });
}

// ============================================================
// RAIL / DRAWER / HISTORY TOGGLE
// ============================================================
function toggleRail() {
  railCollapsed = !railCollapsed;
  const rail = document.getElementById('controlRail');
  const btn  = document.getElementById('railToggle');
  const body = document.getElementById('railBody');
  rail.classList.toggle('collapsed', railCollapsed);
  btn.textContent = railCollapsed ? '›' : '‹';
  body.style.display = railCollapsed ? 'none' : '';
}

function toggleDrawer() {
  drawerCollapsed = !drawerCollapsed;
  document.getElementById('obsDrawer').classList.toggle('collapsed', drawerCollapsed);
}

function toggleHistory() {
  historyExpanded = !historyExpanded;
  document.getElementById('historyBar').classList.toggle('expanded', historyExpanded);
}

function toggleGroup(id) {
  const grp  = document.getElementById(id);
  const chev = document.getElementById(`chev-${id}`);
  grp.classList.toggle('open');
  if (chev) chev.textContent = grp.classList.contains('open') ? '▾' : '▸';
}

// ============================================================
// FILTER / CONTROL LOGIC
// ============================================================
function getFilteredEvents() {
  const subtype   = document.getElementById('ctrl-subtype')?.value   || 'all';
  const daterange = document.getElementById('ctrl-daterange')?.value  || 'all';
  const guidance  = document.getElementById('ctrl-guidance')?.value   || 'all';
  const vix       = document.getElementById('ctrl-vix')?.value        || 'all';
  const trend     = document.getElementById('ctrl-trend')?.value      || 'all';
  const minSample = parseInt(document.getElementById('ctrl-minsample')?.value || '5');
  const inclOutliers = document.getElementById('chk-outliers')?.checked ?? true;

  let events = eventHistory.filter(e => !e.excluded);
  if (!inclOutliers) events = events.filter(e => e.analogueScore > 20);

  if (subtype !== 'all')   events = events.filter(e => e.beatType === subtype);
  if (guidance !== 'all')  events = events.filter(e => e.guidance === guidance);
  if (trend !== 'all')     events = events.filter(e => e.marketTrend === trend);

  if (vix === 'low')  events = events.filter(e => e.vix < 15);
  if (vix === 'mid')  events = events.filter(e => e.vix >= 15 && e.vix <= 25);
  if (vix === 'high') events = events.filter(e => e.vix > 25);

  if (daterange === '5y') events = events.filter(e => parseInt(e.date.slice(0,4)) >= 2020);
  if (daterange === '3y') events = events.filter(e => parseInt(e.date.slice(0,4)) >= 2022);

  return { events, minSample };
}

function onControlChange() {
  const { events, minSample } = getFilteredEvents();
  activeN = events.length;

  const obsEl = document.getElementById('obsCount');
  if (obsEl) obsEl.textContent = `N = ${activeN}`;

  const emptyState = document.getElementById('empty-state');
  const tabPanels  = document.getElementById('tabPanels');

  if (activeN < minSample) {
    document.getElementById('empty-n').textContent = activeN;
    emptyState.classList.add('visible');
    tabPanels.style.display = 'none';
  } else {
    emptyState.classList.remove('visible');
    tabPanels.style.display = '';
    refreshCharts(events);
    renderBeatRate(events);
  }
}

function resetFilters() {
  document.querySelectorAll('.ctrl-select').forEach(s => s.selectedIndex = 0);
  document.getElementById('ctrl-minsample').value = '5';
  document.getElementById('chk-outliers').checked = true;
  onControlChange();
}

function renderBeatRate(events) {
  const beats = events.filter(e => e.absMove > e.impliedMove).length;
  const total = events.filter(e => e.impliedMove).length;
  const pct   = total ? Math.round((beats / total) * 100) : 0;
  const el = document.getElementById('beat-rate-val');
  const p  = document.getElementById('beat-rate-pct');
  if (el) el.textContent = `${beats} / ${total}`;
  if (p)  p.textContent  = `${pct}% · N=${total} events`;
}

// ============================================================
// CHART INIT — OVERVIEW
// ============================================================
function initAllCharts() {
  initPriceOverviewChart();
  initMoveDistChart();
  initIVOverviewChart();
}

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

function refreshCharts(events) {
  // Rebuild all visible charts with filtered data
  const { events: filtered } = getFilteredEvents();
  destroyChart('chart-price-overview');
  destroyChart('chart-move-dist');
  destroyChart('chart-iv-overview');
  initPriceOverviewChart();
  initMoveDistChart();
  initIVOverviewChart();
  if (activeTab === 'price-impact') initPriceImpactCharts();
  if (activeTab === 'implied-vol')  initIVCharts();
}

// ─── Overview: Price Path ────────────────────────────────────
function initPriceOverviewChart() {
  destroyChart('chart-price-overview');
  const ctx = document.getElementById('chart-price-overview');
  if (!ctx) return;

  const labels  = PRICE_DAYS;
  const currentData = pricePaths.current.map((v, i) => v === null ? null : v);

  chartInstances['chart-price-overview'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '75th %ile',
          data: pricePaths.p75,
          borderColor: 'transparent',
          backgroundColor: C.copperAlpha,
          fill: '+1',
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: '25th %ile',
          data: pricePaths.p25,
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'Median',
          data: pricePaths.median,
          borderColor: C.copper,
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          fill: false,
          tension: 0.4,
          pointRadius: 2,
          pointBackgroundColor: C.copper,
        },
        {
          label: 'Current event (partial)',
          data: currentData,
          borderColor: C.blue,
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          borderDash: [5, 3],
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: C.blue,
          spanGaps: false,
        }
      ]
    },
    options: priceChartOptions('Return vs. T0 (%)', true),
  });
}

// ─── Overview: Move Distribution ─────────────────────────────
function initMoveDistChart() {
  destroyChart('chart-move-dist');
  const ctx = document.getElementById('chart-move-dist');
  if (!ctx) return;

  const { events } = getFilteredEvents();
  const bins  = moveHistBins;
  const counts = bins.map(b => events.filter(e => {
    const m = e.actualMove;
    return m > b.min && m <= b.max;
  }).length);

  chartInstances['chart-move-dist'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: bins.map(b => b.label),
      datasets: [{
        label: 'Events',
        data: counts,
        backgroundColor: bins.map(b => b.color + 'CC'),
        borderColor: bins.map(b => b.color),
        borderWidth: 1,
        borderRadius: 3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: items => items[0].label,
            label: item => `${item.raw} event${item.raw !== 1 ? 's' : ''}`,
            afterLabel: item => {
              const total = counts.reduce((a, b) => a + b, 0);
              return `${total > 0 ? Math.round(item.raw / total * 100) : 0}% of sample`;
            }
          }
        },
        annotation: {
          annotations: {
            impliedLeft: {
              type: 'line',
              xMin: 1.1,
              xMax: 1.1,
              borderColor: C.copper,
              borderWidth: 1.5,
              borderDash: [4, 3],
              label: { display: true, content: '-8.2%', position: 'start', font: { size: 9 }, color: C.copper, backgroundColor: 'rgba(245,243,238,0.85)', padding: 2 }
            },
            impliedRight: {
              type: 'line',
              xMin: 7.9,
              xMax: 7.9,
              borderColor: C.copper,
              borderWidth: 1.5,
              borderDash: [4, 3],
              label: { display: true, content: '+8.2%', position: 'start', font: { size: 9 }, color: C.copper, backgroundColor: 'rgba(245,243,238,0.85)', padding: 2 }
            }
          }
        }
      },
      scales: {
        x: { grid: { color: C.grid }, ticks: { font: { size: 9 }, maxRotation: 30 } },
        y: {
          grid: { color: C.grid },
          ticks: { stepSize: 1, font: { size: 10 }, callback: v => v === 0 ? '' : v },
          title: { display: true, text: 'Events', font: { size: 10 }, color: C.text2 },
          min: 0,
          grace: '10%'
        }
      }
    }
  });
}

// ─── Overview: IV Ramp/Crush ─────────────────────────────────
function initIVOverviewChart() {
  destroyChart('chart-iv-overview');
  const ctx = document.getElementById('chart-iv-overview');
  if (!ctx) return;

  const preDays  = IV_DAYS_PRE;
  const postDays = IV_DAYS_POST.slice(1); // skip T0 (already in pre)
  const allDays  = [...preDays, ...postDays.filter(d => d > 0)];

  const medianAll  = [...ivPaths.preMedian,  ...ivPaths.postMedian.slice(1)];
  const p25All     = [...ivPaths.preP25,     ...ivPaths.postP25.slice(1)];
  const p75All     = [...ivPaths.preP75,     ...ivPaths.postP75.slice(1)];
  const currentAll = [
    ...ivPaths.preCurrent,
    ...ivPaths.postCurrent.slice(1)
  ];

  chartInstances['chart-iv-overview'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allDays,
      datasets: [
        {
          label: '75th %ile',
          data: p75All,
          borderColor: 'transparent',
          backgroundColor: C.copperAlpha,
          fill: '+1',
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: '25th %ile',
          data: p25All,
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'Historical Median IV',
          data: medianAll,
          borderColor: C.copper,
          borderWidth: 2.5,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        },
        {
          label: 'Current Event IV',
          data: currentAll,
          borderColor: C.blue,
          borderWidth: 2.5,
          borderDash: [5, 3],
          fill: false,
          tension: 0.4,
          pointRadius: (ctx, idx) => idx.dataIndex === ivPaths.preCurrent.length - 1 ? 5 : 0,
          pointBackgroundColor: C.blue,
          spanGaps: false,
        }
      ]
    },
    options: ivChartOptions(allDays),
  });
}

// ============================================================
// PRICE IMPACT TAB CHARTS
// ============================================================
function initPriceImpactCharts() {
  if (chartInstances['chart-price-full']) return;
  initPriceFullChart();
  initReturnHistChart();
  initScatterChart();
}

function initPriceFullChart() {
  destroyChart('chart-price-full');
  const ctx = document.getElementById('chart-price-full');
  if (!ctx) return;

  chartInstances['chart-price-full'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: PRICE_DAYS,
      datasets: [
        { label: '75th %ile', data: pricePaths.p75,    borderColor: 'transparent', backgroundColor: C.copperAlpha, fill: '+1', tension: 0.4, pointRadius: 0 },
        { label: '25th %ile', data: pricePaths.p25,    borderColor: 'transparent', backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 0 },
        { label: 'Median',    data: pricePaths.median, borderColor: C.copper,       borderWidth: 2.5, fill: false, tension: 0.4, pointRadius: 3, pointBackgroundColor: C.copper },
        { label: 'Current event (partial)', data: pricePaths.current, borderColor: C.blue, borderWidth: 2.5, borderDash: [5,3], fill: false, tension: 0.4, pointRadius: 4, pointBackgroundColor: C.blue, spanGaps: false }
      ]
    },
    options: priceChartOptions('Return vs. T0 (%)', true),
  });
}

function initReturnHistChart() {
  destroyChart('chart-return-hist');
  const ctx = document.getElementById('chart-return-hist');
  if (!ctx) return;

  const { events } = getFilteredEvents();
  const bins   = moveHistBins;
  const counts = bins.map(b => events.filter(e => e.actualMove > b.min && e.actualMove <= b.max).length);

  chartInstances['chart-return-hist'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: bins.map(b => b.label),
      datasets: [{ label: 'Events', data: counts, backgroundColor: bins.map(b => b.color + 'CC'), borderColor: bins.map(b => b.color), borderWidth: 1, borderRadius: 3 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: i => `${i.raw} events` } } },
      scales: { x: { grid: { color: C.grid }, ticks: { font: { size: 9 }, maxRotation: 40 } }, y: { grid: { color: C.grid }, ticks: { stepSize: 1, font: { size: 10 } }, min: 0, grace: '10%' } }
    }
  });
}

function initScatterChart() {
  destroyChart('chart-scatter');
  const ctx = document.getElementById('chart-scatter');
  if (!ctx) return;

  const { events } = getFilteredEvents();
  const points = events.map(e => ({ x: e.epsSurprise, y: e.actualMove }));
  const colors = points.map(p => p.y >= 0 ? C.green + 'CC' : C.red + 'CC');

  chartInstances['chart-scatter'] = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Event',
        data: points,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('CC', 'FF')),
        borderWidth: 1,
        pointRadius: 6,
        pointHoverRadius: 8,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: item => {
              const e = events[item.dataIndex];
              return [`${e.date} · ${e.quarter}`, `EPS surprise: ${e.epsSurprise > 0 ? '+' : ''}${e.epsSurprise.toFixed(1)}%`, `Actual move: ${e.actualMove > 0 ? '+' : ''}${e.actualMove.toFixed(1)}%`];
            }
          }
        }
      },
      scales: {
        x: { grid: { color: C.grid }, title: { display: true, text: 'EPS Surprise (%)', font: { size: 10 }, color: C.text2 }, ticks: { font: { size: 10 } } },
        y: { grid: { color: C.grid }, title: { display: true, text: 'T0→T+1 Return (%)', font: { size: 10 }, color: C.text2 }, ticks: { font: { size: 10 }, callback: v => (v > 0 ? '+' : '') + v + '%' } }
      }
    }
  });
}

// ============================================================
// IMPLIED VOLATILITY TAB CHARTS
// ============================================================
function initIVCharts() {
  if (chartInstances['chart-iv-full']) return;
  initIVFullChart();
  initIVScatterChart();
  initIVCrushChart();
}

function initIVFullChart() {
  destroyChart('chart-iv-full');
  const ctx = document.getElementById('chart-iv-full');
  if (!ctx) return;

  const preDays  = IV_DAYS_PRE;
  const postDays = IV_DAYS_POST.slice(1);
  const allDays  = [...preDays, ...postDays];

  const medAll  = [...ivPaths.preMedian,   ...ivPaths.postMedian.slice(1)];
  const p25All  = [...ivPaths.preP25,      ...ivPaths.postP25.slice(1)];
  const p75All  = [...ivPaths.preP75,      ...ivPaths.postP75.slice(1)];
  const curAll  = [...ivPaths.preCurrent,  ...ivPaths.postCurrent.slice(1)];

  chartInstances['chart-iv-full'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allDays,
      datasets: [
        { label: '75th %ile', data: p75All, borderColor: 'transparent', backgroundColor: C.copperAlpha, fill: '+1', tension: 0.4, pointRadius: 0 },
        { label: '25th %ile', data: p25All, borderColor: 'transparent', backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 0 },
        { label: 'Historical Median', data: medAll, borderColor: C.copper, borderWidth: 2.5, fill: false, tension: 0.4, pointRadius: 0 },
        { label: 'Current Event', data: curAll, borderColor: C.blue, borderWidth: 2.5, borderDash: [5,3], fill: false, tension: 0.4, pointRadius: 3, pointBackgroundColor: C.blue, spanGaps: false }
      ]
    },
    options: ivChartOptions(allDays),
  });
}

function initIVScatterChart() {
  destroyChart('chart-iv-scatter');
  const ctx = document.getElementById('chart-iv-scatter');
  if (!ctx) return;

  const { events } = getFilteredEvents();
  const points = events.map(e => ({ x: e.impliedMove, y: e.absMove }));
  const colors = points.map((p, i) => events[i].absMove > events[i].impliedMove ? C.copper + 'CC' : C.blue + 'AA');

  chartInstances['chart-iv-scatter'] = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        { label: 'Actual > Implied', data: points.filter((p,i) => events[i].absMove > events[i].impliedMove), backgroundColor: C.copper + 'CC', borderColor: C.copper, borderWidth: 1, pointRadius: 6 },
        { label: 'Actual ≤ Implied', data: points.filter((p,i) => events[i].absMove <= events[i].impliedMove), backgroundColor: C.blue + 'AA', borderColor: C.blue, borderWidth: 1, pointRadius: 6 },
        { label: '45° line (A=I)', data: [{x:0,y:0},{x:30,y:30}], borderColor: C.text3, borderWidth: 1, borderDash: [4,4], type:'line', pointRadius: 0, fill: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10, padding: 8 } },
        tooltip: {
          callbacks: {
            label: item => {
              const e = events.find(ev => Math.abs(ev.impliedMove - item.raw.x) < 0.01 && Math.abs(ev.absMove - item.raw.y) < 0.01);
              if (!e) return `Impl: ${item.raw.x}% · Act: ${item.raw.y}%`;
              return [`${e.date} · ${e.quarter}`, `Implied: ±${e.impliedMove.toFixed(1)}%`, `Actual: ${e.actualMove > 0 ? '+' : ''}${e.actualMove.toFixed(1)}%`];
            }
          }
        }
      },
      scales: {
        x: { grid: { color: C.grid }, title: { display: true, text: 'Pre-event Implied Move (%)', font: { size: 10 }, color: C.text2 }, ticks: { font: { size: 10 }, callback: v => '±' + v + '%' } },
        y: { grid: { color: C.grid }, title: { display: true, text: '|Actual Move| (%)', font: { size: 10 }, color: C.text2 }, ticks: { font: { size: 10 }, callback: v => v + '%' } }
      }
    }
  });
}

function initIVCrushChart() {
  destroyChart('chart-iv-crush');
  const ctx = document.getElementById('chart-iv-crush');
  if (!ctx) return;

  const { events } = getFilteredEvents();
  const crushValues = events.map(e => e.ivCrush);
  const labels = ['<−50%','−50 to −45','−45 to −40','−40 to −35','−35 to −30','−30 to −25','−25 to −20','>−20%'];
  const mins   = [-Infinity,-50,-45,-40,-35,-30,-25,-20];
  const maxs   = [-50,-45,-40,-35,-30,-25,-20,Infinity];
  const counts = labels.map((_, i) => crushValues.filter(v => v > mins[i] && v <= maxs[i]).length);

  chartInstances['chart-iv-crush'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Events', data: counts, backgroundColor: C.teal + 'CC', borderColor: C.teal, borderWidth: 1, borderRadius: 3 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: i => `${i.raw} events` } } },
      scales: {
        x: { grid: { color: C.grid }, ticks: { font: { size: 9 }, maxRotation: 30 } },
        y: { grid: { color: C.grid }, ticks: { stepSize: 1, font: { size: 10 } }, min: 0, grace: '10%',
             title: { display: true, text: 'Events', font: { size: 10 }, color: C.text2 } }
      }
    }
  });
}

// ============================================================
// SHARED CHART OPTIONS
// ============================================================
function priceChartOptions(yLabel, showZeroLine = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: items => `T${items[0].label >= 0 ? '+' : ''}${items[0].label}`,
          label: item => {
            if (item.raw === null || item.raw === undefined) return null;
            return `${item.dataset.label}: ${item.raw > 0 ? '+' : ''}${item.raw.toFixed(1)}%`;
          }
        },
        filter: item => item.raw !== null
      }
    },
    scales: {
      x: {
        grid: { color: C.grid },
        title: { display: true, text: 'Days relative to event (T0)', font: { size: 10 }, color: C.text2 },
        ticks: {
          font: { size: 10 },
          callback: v => {
            const d = PRICE_DAYS[v];
            if (d === 0) return 'Event';
            return (d > 0 ? 'T+' : 'T') + d;
          }
        }
      },
      y: {
        grid: { color: C.grid },
        title: { display: true, text: yLabel, font: { size: 10 }, color: C.text2 },
        ticks: { font: { size: 10 }, callback: v => (v > 0 ? '+' : '') + v.toFixed(0) + '%' },
      }
    }
  };
}

function ivChartOptions(allDays) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: items => {
            const d = allDays[items[0].dataIndex];
            return d === 0 ? 'Event (T0)' : (d > 0 ? `T+${d}` : `T${d}`);
          },
          label: item => {
            if (item.raw === null || item.raw === undefined) return null;
            return `${item.dataset.label}: ${item.raw.toFixed(1)}%`;
          }
        },
        filter: item => item.raw !== null
      }
    },
    scales: {
      x: {
        grid: { color: C.grid },
        title: { display: true, text: 'Days relative to event (T0)', font: { size: 10 }, color: C.text2 },
        ticks: {
          font: { size: 10 },
          callback: (v, i) => {
            const d = allDays[i];
            if (d === 0) return 'Evt';
            const show = [-30,-20,-10,-5,-3,-1,1,2,5,10];
            if (d % 5 === 0 || show.includes(d)) {
              return d > 0 ? 'T+' + d : 'T' + d;
            }
            return '';
          },
          maxRotation: 0,
          autoSkip: false,
        }
      },
      y: {
        grid: { color: C.grid },
        title: { display: true, text: 'ATM IV (%)', font: { size: 10 }, color: C.text2 },
        ticks: { font: { size: 10 }, callback: v => v + '%' },
      }
    }
  };
}

// ============================================================
// RENDER: COMPARABLE LIST
// ============================================================
function renderComparableList() {
  const container = document.getElementById('comparable-list');
  if (!container) return;

  container.innerHTML = topAnalogues.map((a, i) => {
    const isPos = a.actualMove.startsWith('+');
    return `
      <div class="comparable-row" onclick="pinAnalogue('${a.id}')">
        <span class="comparable-rank">${i + 1}</span>
        <div class="comparable-info">
          <div class="comparable-date">${a.date}</div>
          <div class="comparable-quarter">${a.quarter}</div>
        </div>
        <span class="comparable-score-pill">${a.score}</span>
        <span class="comparable-move ${isPos ? 'positive' : 'negative'}">${a.actualMove}</span>
      </div>
    `;
  }).join('');
}

// ============================================================
// RENDER: STATEMENTS
// ============================================================
function renderStatements() {
  const container = document.getElementById('statements-container');
  if (!container) return;

  container.innerHTML = descriptiveStatements.map(s => `
    <div class="statement-card">
      <div style="flex:1">
        <div class="statement-text">${s.text}</div>
        <div class="statement-meta">Source: ${s.source} · Sample: ${s.sample} · N=${s.n}</div>
      </div>
      <button class="inspect-btn" style="flex-shrink:0" onclick="openMethodology('${s.source}')" title="Methodology">?</button>
    </div>
  `).join('');
}

// ============================================================
// RENDER: DRAWER ANALOGUES
// ============================================================
function renderDrawerAnalogues() {
  const container = document.getElementById('analogue-cards');
  if (!container) return;

  container.innerHTML = topAnalogues.slice(0, 4).map(a => {
    const isPos = a.actualMove.startsWith('+');
    return `
      <div class="analogue-card" id="analogue-${a.id}">
        <div class="analogue-header">
          <div>
            <div class="analogue-date">${a.date}</div>
            <div class="analogue-quarter">${a.quarter}</div>
          </div>
          <div class="analogue-score">
            <div class="analogue-score-val">${a.score}</div>
            <div class="analogue-score-label">score</div>
          </div>
        </div>
        <div class="analogue-move ${isPos ? 'positive' : 'negative'}" style="margin-bottom:4px">
          ${a.actualMove} actual move · IV crush: ${a.ivCrush}
        </div>
        <div class="analogue-sims">
          ${a.similarities.slice(0, 2).map(s => `<div class="analogue-sim-item">${s}</div>`).join('')}
        </div>
        <div class="analogue-actions">
          <button class="analogue-btn" onclick="pinAnalogue('${a.id}')">Pin</button>
          <button class="analogue-btn" onclick="overlayAnalogue('${a.id}')">Overlay</button>
          <button class="analogue-btn" onclick="openAnalogue('${a.id}')">Inspect</button>
        </div>
      </div>
    `;
  }).join('');
}

function pinAnalogue(id) {
  const el = document.getElementById(`analogue-${id}`);
  if (el) el.classList.toggle('pinned');
}
function overlayAnalogue(id) { /* phase 1 */ }
function openAnalogue(id) { /* phase 1 */ }

// ============================================================
// RENDER: EVENT TABLES
// ============================================================
function renderMiniEventTable() {
  const tbody = document.getElementById('mini-event-body');
  if (!tbody) return;

  const active = eventHistory.filter(e => !e.excluded);
  tbody.innerHTML = active.slice(0, 10).map(e => renderEventRow(e, 'mini')).join('');
}

function renderFullEventTable(events) {
  const tbody = document.getElementById('full-event-body');
  if (!tbody) return;

  tbody.innerHTML = events.map(e => renderEventRow(e, 'full')).join('');
}

function renderEventRow(e, mode) {
  const aiRatio = e.impliedMove > 0 ? (e.absMove / e.impliedMove).toFixed(2) : '—';
  const moveClass = e.actualMove >= 0 ? 'positive-val' : 'negative-val';
  const ivCrushClass = e.ivCrush < 0 ? 'negative-val' : 'positive-val';

  if (mode === 'mini') {
    return `
      <tr class="${e.excluded ? 'excluded' : ''}" title="${e.excluded ? 'Excluded: ' + e.excludeReason : ''}">
        <td class="mono">${e.date}</td>
        <td>${e.quarter}</td>
        <td><span class="mono ${e.epsSurprise >= 0 ? 'positive-val' : 'negative-val'}">${e.epsSurprise > 0 ? '+' : ''}${e.epsSurprise.toFixed(1)}%</span></td>
        <td class="mono">±${e.impliedMove.toFixed(1)}%</td>
        <td class="mono ${moveClass}">${e.actualMove > 0 ? '+' : ''}${e.actualMove.toFixed(1)}%</td>
        <td class="mono">${aiRatio}×</td>
        <td class="mono">${e.ivBefore}% → ${e.ivAfter}%</td>
        <td class="mono ${ivCrushClass}">${e.ivCrush.toFixed(1)}%</td>
        <td><span class="beat-badge ${e.beatType}">${beatTypeLabel(e.beatType)}</span></td>
      </tr>`;
  }

  return `
    <tr class="${e.excluded ? 'excluded' : ''}" title="${e.excluded ? 'EXCLUDED: ' + (e.excludeReason || '') : ''}">
      <td class="mono">${e.date}</td>
      <td>${e.quarter}</td>
      <td style="font-size:10px;color:var(--text-2)">${e.timing}</td>
      <td class="mono ${e.epsSurprise >= 0 ? 'positive-val' : 'negative-val'}">${e.epsSurprise > 0 ? '+' : ''}${e.epsSurprise.toFixed(1)}%</td>
      <td class="mono ${e.revSurprise >= 0 ? 'positive-val' : 'negative-val'}">${e.revSurprise > 0 ? '+' : ''}${e.revSurprise.toFixed(1)}%</td>
      <td><span class="guidance-badge ${e.guidance}">${e.guidance.charAt(0).toUpperCase() + e.guidance.slice(1)}</span></td>
      <td class="mono">±${e.impliedMove.toFixed(1)}%</td>
      <td class="mono ${moveClass}">${e.actualMove > 0 ? '+' : ''}${e.actualMove.toFixed(1)}%</td>
      <td class="mono">${aiRatio}×</td>
      <td class="mono">${e.ivBefore}%</td>
      <td class="mono ${ivCrushClass}">${e.ivCrush.toFixed(1)}%</td>
      <td><span class="beat-badge ${e.beatType}">${beatTypeLabel(e.beatType)}</span></td>
      <td>
        ${e.excluded ? `<span class="flag-badge">EXCL</span>` : ''}
        ${e.note ? `<span style="font-size:10px;color:var(--text-3)">${e.note.slice(0, 40)}${e.note.length > 40 ? '…' : ''}</span>` : ''}
      </td>
    </tr>`;
}

function beatTypeLabel(bt) {
  const map = { double_beat: 'Double Beat', eps_beat: 'EPS Beat', rev_beat: 'Rev Beat', miss: 'Miss', double_miss: 'Double Miss' };
  return map[bt] || bt;
}

// ============================================================
// SORT
// ============================================================
function sortEvents(col) {
  if (activeSort.col === col) {
    activeSort.dir = activeSort.dir === 'asc' ? 'desc' : 'asc';
  } else {
    activeSort.col = col;
    activeSort.dir = 'desc';
  }

  const sorted = [...eventHistory].sort((a, b) => {
    const av = a[col] ?? 0;
    const bv = b[col] ?? 0;
    return activeSort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  renderFullEventTable(sorted);
}

// ============================================================
// RENDER: SUMMARY TABLES
// ============================================================
function renderPriceSummaryTable() {
  const tbody = document.getElementById('price-summary-body');
  if (!tbody) return;
  tbody.innerHTML = priceSummaryData.map(r => `
    <tr>
      <td>${r.window}</td>
      <td class="mono ${r.median.startsWith('+') ? 'positive-val' : 'negative-val'}">${r.median}</td>
      <td class="mono ${r.mean.startsWith('+') ? 'positive-val' : 'negative-val'}">${r.mean}</td>
      <td class="mono text-secondary">${r.p25}</td>
      <td class="mono text-secondary">${r.p75}</td>
      <td class="mono">${r.pctPos}</td>
      <td class="mono text-muted">${r.n}</td>
    </tr>`).join('');
}

function renderIVSummaryTable() {
  const tbody = document.getElementById('iv-summary-body');
  if (!tbody) return;
  tbody.innerHTML = ivSummaryData.map(r => `
    <tr>
      <td>${r.metric}</td>
      <td class="mono">${r.median}</td>
      <td class="mono">${r.mean}</td>
      <td class="mono text-secondary">${r.p25}</td>
      <td class="mono text-secondary">${r.p75}</td>
      <td class="mono text-muted">${r.n}</td>
    </tr>`).join('');
}

// ============================================================
// RENDER: METHODOLOGY TAB
// ============================================================
function renderMethodologyTab() {
  const grid = document.getElementById('method-grid');
  if (!grid) return;

  grid.innerHTML = Object.entries(methodology).map(([key, m]) => `
    <div class="method-section" id="method-sect-${key}">
      <div class="method-section-header" onclick="toggleMethodSection('${key}')">
        <span class="method-section-title">${m.title}</span>
        <span style="font-size:13px;color:var(--text-3)" id="mchev-${key}">▸</span>
      </div>
      <div class="method-section-body" id="method-body-${key}">
        ${m.body.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('')}
      </div>
      <div class="method-source">
        <span><strong>Source:</strong> ${m.source}</span>
        <span><strong>Sample:</strong> ${m.sampleSize}</span>
      </div>
    </div>`).join('');
}

function toggleMethodSection(key) {
  const sect = document.getElementById(`method-sect-${key}`);
  const chev = document.getElementById(`mchev-${key}`);
  sect.classList.toggle('open');
  if (chev) chev.textContent = sect.classList.contains('open') ? '▾' : '▸';
}

// ============================================================
// METHODOLOGY MODAL
// ============================================================
function openMethodology(key) {
  const m = methodology[key];
  if (!m) return;

  document.getElementById('modal-title').textContent = m.title;
  document.getElementById('modal-body').innerHTML = m.body.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');
  document.getElementById('modal-footer').innerHTML = `<strong>Source:</strong> ${m.source} &nbsp;·&nbsp; <strong>Sample:</strong> ${m.sampleSize}`;
  document.getElementById('methodModal').classList.add('open');
}

function closeMethodology() {
  document.getElementById('methodModal').classList.remove('open');
}

// Close modal on overlay click
document.getElementById('methodModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeMethodology();
});

// ============================================================
// COUNTDOWN TIMER
// ============================================================
function startCountdown() {
  // Event is Nov 20, 2024 16:00 ET. Since this is synthetic, show a static countdown
  // that ticks in real time from a synthetic start point.
  const el = document.getElementById('hdr-countdown');
  if (!el) return;

  const TARGET_MS = 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000 + 23 * 60 * 1000;
  const start = Date.now();

  function tick() {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, TARGET_MS - elapsed);

    const d = Math.floor(remaining / 86400000);
    const h = Math.floor((remaining % 86400000) / 3600000);
    const m = Math.floor((remaining % 3600000) / 60000);

    el.textContent = `${d}d ${h}h ${m}m`;
    if (remaining > 0) setTimeout(tick, 30000);
  }

  tick();
}
