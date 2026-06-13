// Ticker Event Workbench — Synthetic Data
// NVDA · Earnings · FY2019–FY2025 · All numbers are realistic synthetic data.
// No live data calls. Self-contained prototype.

const CURRENT_TICKER = {
  symbol: 'NVDA',
  name: 'NVIDIA Corporation',
  price: 881.50,
  change: +10.58,
  changePct: +1.21,
  sector: 'Information Technology',
  industry: 'Semiconductors'
};

const CURRENT_EVENT = {
  family: 'Earnings',
  quarter: 'Q3 FY25',
  date: 'Nov 20, 2024',
  timing: 'after_market',
  confirmed: true,
  countdownDays: 2,
  countdownHours: 4,
  countdownMins: 23,
  relevantExpiry: 'Nov 22, 2024',
  expDTE: 2,
  currentATMIV: 68.4,
  ivPercentile: 72,
  impliedMove: 8.2,
  impliedProb: 33,  // % chance of move > implied
  eventPremium: 34.2,
  epsEstimate: 0.73,
  revEstimate: 32.8
};

// 23 historical NVDA earnings events · 2 excluded (COVID + crypto collapse)
const eventHistory = [
  {
    id: 'E023', date: '2024-08-28', quarter: 'Q2 FY25', timing: 'AMC',
    epsEst: 0.64, epsActual: 0.68, epsSurprise: 6.3,
    revEst: 28.6, revActual: 30.0, revSurprise: 4.9,
    impliedMove: 8.2, actualMove: +9.5, absMove: 9.5, direction: 'up',
    ivBefore: 68, ivAfter: 41, ivCrush: -39.7,
    startPrice: 116.00, endPrice: 127.02,
    beatType: 'double_beat', guidance: 'raised',
    vix: 16.2, marketTrend: 'bull', excluded: false,
    analogueScore: 94, note: ''
  },
  {
    id: 'E022', date: '2024-05-22', quarter: 'Q1 FY25', timing: 'AMC',
    epsEst: 5.56, epsActual: 6.12, epsSurprise: 10.1,
    revEst: 24.6, revActual: 26.0, revSurprise: 5.7,
    impliedMove: 7.4, actualMove: +6.2, absMove: 6.2, direction: 'up',
    ivBefore: 62, ivAfter: 38, ivCrush: -38.7,
    startPrice: 877.35, endPrice: 931.52,
    beatType: 'double_beat', guidance: 'raised',
    vix: 12.8, marketTrend: 'bull', excluded: false,
    analogueScore: 87, note: ''
  },
  {
    id: 'E021', date: '2024-02-21', quarter: 'Q4 FY24', timing: 'AMC',
    epsEst: 4.59, epsActual: 5.16, epsSurprise: 12.4,
    revEst: 20.4, revActual: 22.1, revSurprise: 8.3,
    impliedMove: 9.1, actualMove: +16.4, absMove: 16.4, direction: 'up',
    ivBefore: 74, ivAfter: 49, ivCrush: -33.8,
    startPrice: 613.60, endPrice: 713.97,
    beatType: 'double_beat', guidance: 'raised',
    vix: 14.2, marketTrend: 'bull', excluded: false,
    analogueScore: 71, note: 'Major AI cycle acceleration; outlier magnitude'
  },
  {
    id: 'E020', date: '2023-11-21', quarter: 'Q3 FY24', timing: 'AMC',
    epsEst: 3.37, epsActual: 4.02, epsSurprise: 19.3,
    revEst: 16.1, revActual: 18.1, revSurprise: 12.4,
    impliedMove: 7.8, actualMove: +11.8, absMove: 11.8, direction: 'up',
    ivBefore: 65, ivAfter: 40, ivCrush: -38.5,
    startPrice: 455.72, endPrice: 509.54,
    beatType: 'double_beat', guidance: 'raised',
    vix: 14.8, marketTrend: 'bull', excluded: false,
    analogueScore: 82, note: ''
  },
  {
    id: 'E019', date: '2023-08-23', quarter: 'Q2 FY24', timing: 'AMC',
    epsEst: 2.09, epsActual: 2.70, epsSurprise: 29.2,
    revEst: 11.2, revActual: 13.5, revSurprise: 20.5,
    impliedMove: 8.9, actualMove: +8.4, absMove: 8.4, direction: 'up',
    ivBefore: 71, ivAfter: 44, ivCrush: -38.0,
    startPrice: 403.32, endPrice: 437.00,
    beatType: 'double_beat', guidance: 'raised',
    vix: 15.5, marketTrend: 'bull', excluded: false,
    analogueScore: 78, note: ''
  },
  {
    id: 'E018', date: '2023-05-24', quarter: 'Q1 FY24', timing: 'AMC',
    epsEst: 0.92, epsActual: 1.09, epsSurprise: 18.5,
    revEst: 6.5, revActual: 7.2, revSurprise: 10.8,
    impliedMove: 9.7, actualMove: +24.4, absMove: 24.4, direction: 'up',
    ivBefore: 63, ivAfter: 52, ivCrush: -17.5,
    startPrice: 303.41, endPrice: 377.43,
    beatType: 'double_beat', guidance: 'raised',
    vix: 17.1, marketTrend: 'neutral', excluded: false,
    analogueScore: 45, note: 'AI demand guidance inflection; extreme outlier move'
  },
  {
    id: 'E017', date: '2023-02-22', quarter: 'Q4 FY23', timing: 'AMC',
    epsEst: 0.81, epsActual: 0.88, epsSurprise: 8.6,
    revEst: 6.0, revActual: 6.1, revSurprise: 1.7,
    impliedMove: 7.3, actualMove: +14.1, absMove: 14.1, direction: 'up',
    ivBefore: 58, ivAfter: 38, ivCrush: -34.5,
    startPrice: 199.65, endPrice: 227.77,
    beatType: 'double_beat', guidance: 'maintained',
    vix: 20.3, marketTrend: 'bull', excluded: false,
    analogueScore: 62, note: 'First AI-cycle beat; market re-rated'
  },
  {
    id: 'E016', date: '2022-11-16', quarter: 'Q3 FY23', timing: 'AMC',
    epsEst: 0.71, epsActual: 0.58, epsSurprise: -18.3,
    revEst: 5.9, revActual: 5.9, revSurprise: 0.0,
    impliedMove: 8.4, actualMove: -5.2, absMove: 5.2, direction: 'down',
    ivBefore: 76, ivAfter: 55, ivCrush: -27.6,
    startPrice: 131.23, endPrice: 124.39,
    beatType: 'miss', guidance: 'lowered',
    vix: 24.2, marketTrend: 'bear', excluded: false,
    analogueScore: 22, note: ''
  },
  {
    id: 'E015', date: '2022-08-24', quarter: 'Q2 FY23', timing: 'AMC',
    epsEst: 0.51, epsActual: 0.51, epsSurprise: 0.0,
    revEst: 6.7, revActual: 6.7, revSurprise: 0.0,
    impliedMove: 9.1, actualMove: -6.3, absMove: 6.3, direction: 'down',
    ivBefore: 72, ivAfter: 52, ivCrush: -27.8,
    startPrice: 180.52, endPrice: 169.15,
    beatType: 'miss', guidance: 'lowered',
    vix: 21.8, marketTrend: 'bear', excluded: false,
    analogueScore: 19, note: ''
  },
  {
    id: 'E014', date: '2022-05-25', quarter: 'Q1 FY23', timing: 'AMC',
    epsEst: 1.29, epsActual: 1.36, epsSurprise: 5.4,
    revEst: 8.1, revActual: 8.3, revSurprise: 2.5,
    impliedMove: 8.8, actualMove: -7.7, absMove: 7.7, direction: 'down',
    ivBefore: 80, ivAfter: 62, ivCrush: -22.5,
    startPrice: 186.97, endPrice: 172.56,
    beatType: 'eps_beat', guidance: 'lowered',
    vix: 28.5, marketTrend: 'bear', excluded: false,
    analogueScore: 18, note: 'EPS beat but lowered guidance; market risk-off'
  },
  {
    id: 'E013', date: '2022-02-16', quarter: 'Q4 FY22', timing: 'AMC',
    epsEst: 1.22, epsActual: 1.32, epsSurprise: 8.2,
    revEst: 7.4, revActual: 7.6, revSurprise: 2.7,
    impliedMove: 7.6, actualMove: +7.6, absMove: 7.6, direction: 'up',
    ivBefore: 62, ivAfter: 40, ivCrush: -35.5,
    startPrice: 244.00, endPrice: 262.55,
    beatType: 'double_beat', guidance: 'maintained',
    vix: 27.8, marketTrend: 'neutral', excluded: false,
    analogueScore: 41, note: ''
  },
  {
    id: 'E012', date: '2021-11-17', quarter: 'Q3 FY22', timing: 'AMC',
    epsEst: 1.11, epsActual: 1.17, epsSurprise: 5.4,
    revEst: 6.8, revActual: 7.1, revSurprise: 4.4,
    impliedMove: 6.8, actualMove: +8.3, absMove: 8.3, direction: 'up',
    ivBefore: 54, ivAfter: 34, ivCrush: -37.0,
    startPrice: 283.37, endPrice: 306.88,
    beatType: 'double_beat', guidance: 'raised',
    vix: 17.4, marketTrend: 'bull', excluded: false,
    analogueScore: 56, note: ''
  },
  {
    id: 'E011', date: '2021-08-18', quarter: 'Q2 FY22', timing: 'AMC',
    epsEst: 1.02, epsActual: 1.04, epsSurprise: 2.0,
    revEst: 6.3, revActual: 6.5, revSurprise: 3.2,
    impliedMove: 6.4, actualMove: +5.1, absMove: 5.1, direction: 'up',
    ivBefore: 50, ivAfter: 32, ivCrush: -36.0,
    startPrice: 191.08, endPrice: 200.82,
    beatType: 'double_beat', guidance: 'raised',
    vix: 18.1, marketTrend: 'bull', excluded: false,
    analogueScore: 64, note: ''
  },
  {
    id: 'E010', date: '2021-05-26', quarter: 'Q1 FY22', timing: 'AMC',
    epsEst: 0.91, epsActual: 0.94, epsSurprise: 3.3,
    revEst: 5.3, revActual: 5.7, revSurprise: 7.5,
    impliedMove: 6.1, actualMove: +3.7, absMove: 3.7, direction: 'up',
    ivBefore: 47, ivAfter: 30, ivCrush: -36.2,
    startPrice: 166.91, endPrice: 173.08,
    beatType: 'double_beat', guidance: 'raised',
    vix: 18.9, marketTrend: 'bull', excluded: false,
    analogueScore: 59, note: ''
  },
  {
    id: 'E009', date: '2021-02-24', quarter: 'Q4 FY21', timing: 'AMC',
    epsEst: 0.80, epsActual: 0.89, epsSurprise: 11.3,
    revEst: 4.8, revActual: 5.0, revSurprise: 4.2,
    impliedMove: 5.9, actualMove: +6.2, absMove: 6.2, direction: 'up',
    ivBefore: 51, ivAfter: 33, ivCrush: -35.3,
    startPrice: 535.66, endPrice: 568.89,
    beatType: 'double_beat', guidance: 'raised',
    vix: 22.5, marketTrend: 'bull', excluded: false,
    analogueScore: 52, note: ''
  },
  {
    id: 'E008', date: '2020-11-18', quarter: 'Q3 FY21', timing: 'AMC',
    epsEst: 0.72, epsActual: 0.78, epsSurprise: 8.3,
    revEst: 4.4, revActual: 4.7, revSurprise: 6.8,
    impliedMove: 6.3, actualMove: +5.4, absMove: 5.4, direction: 'up',
    ivBefore: 52, ivAfter: 33, ivCrush: -36.5,
    startPrice: 526.45, endPrice: 555.01,
    beatType: 'double_beat', guidance: 'raised',
    vix: 23.1, marketTrend: 'bull', excluded: false,
    analogueScore: 55, note: ''
  },
  {
    id: 'E007', date: '2020-08-19', quarter: 'Q2 FY21', timing: 'AMC',
    epsEst: 1.95, epsActual: 2.18, epsSurprise: 11.8,
    revEst: 3.7, revActual: 3.9, revSurprise: 5.4,
    impliedMove: 6.8, actualMove: +4.8, absMove: 4.8, direction: 'up',
    ivBefore: 48, ivAfter: 31, ivCrush: -35.4,
    startPrice: 445.85, endPrice: 467.26,
    beatType: 'double_beat', guidance: 'raised',
    vix: 22.7, marketTrend: 'bull', excluded: false,
    analogueScore: 51, note: ''
  },
  {
    id: 'E006', date: '2020-05-21', quarter: 'Q1 FY21', timing: 'AMC',
    epsEst: 1.69, epsActual: 1.80, epsSurprise: 6.5,
    revEst: 3.0, revActual: 3.1, revSurprise: 3.3,
    impliedMove: 7.2, actualMove: -2.1, absMove: 2.1, direction: 'down',
    ivBefore: 58, ivAfter: 40, ivCrush: -31.0,
    startPrice: 351.10, endPrice: 343.73,
    beatType: 'eps_beat', guidance: 'maintained',
    vix: 29.8, marketTrend: 'neutral', excluded: false,
    analogueScore: 28, note: 'Beat but COVID-era uncertainty; negative open'
  },
  {
    id: 'E005', date: '2020-02-13', quarter: 'Q4 FY20', timing: 'AMC',
    epsEst: 1.65, epsActual: 1.89, epsSurprise: 14.5,
    revEst: 3.0, revActual: 3.1, revSurprise: 3.3,
    impliedMove: 6.2, actualMove: +7.2, absMove: 7.2, direction: 'up',
    ivBefore: 44, ivAfter: 28, ivCrush: -36.4,
    startPrice: 268.32, endPrice: 287.66,
    beatType: 'double_beat', guidance: 'raised',
    vix: 15.3, marketTrend: 'bull', excluded: false,
    analogueScore: 67, note: ''
  },
  {
    id: 'E004', date: '2019-11-14', quarter: 'Q3 FY20', timing: 'AMC',
    epsEst: 1.57, epsActual: 1.78, epsSurprise: 13.4,
    revEst: 2.9, revActual: 3.0, revSurprise: 3.4,
    impliedMove: 5.8, actualMove: +4.5, absMove: 4.5, direction: 'up',
    ivBefore: 46, ivAfter: 28, ivCrush: -39.1,
    startPrice: 209.97, endPrice: 219.41,
    beatType: 'double_beat', guidance: 'maintained',
    vix: 12.5, marketTrend: 'bull', excluded: false,
    analogueScore: 53, note: ''
  },
  {
    id: 'E003', date: '2019-08-15', quarter: 'Q2 FY20', timing: 'AMC',
    epsEst: 1.15, epsActual: 1.24, epsSurprise: 7.8,
    revEst: 2.5, revActual: 2.6, revSurprise: 4.0,
    impliedMove: 6.4, actualMove: +6.2, absMove: 6.2, direction: 'up',
    ivBefore: 51, ivAfter: 32, ivCrush: -37.3,
    startPrice: 156.35, endPrice: 166.05,
    beatType: 'double_beat', guidance: 'maintained',
    vix: 19.5, marketTrend: 'neutral', excluded: false,
    analogueScore: 47, note: ''
  },
  // Excluded events
  {
    id: 'E002', date: '2020-03-18', quarter: 'Q4 FY19 (pre-COVID)', timing: 'AMC',
    epsEst: 1.48, epsActual: 1.24, epsSurprise: -16.2,
    revEst: 3.0, revActual: 2.2, revSurprise: -26.7,
    impliedMove: 14.2, actualMove: -16.7, absMove: 16.7, direction: 'down',
    ivBefore: 112, ivAfter: 89, ivCrush: -20.5,
    startPrice: 284.35, endPrice: 236.90,
    beatType: 'double_miss', guidance: 'lowered',
    vix: 68.5, marketTrend: 'bear',
    excluded: true, excludeReason: 'COVID-19 market dislocation · VIX > 60 · structural break',
    analogueScore: 5, note: ''
  },
  {
    id: 'E001', date: '2019-05-16', quarter: 'Q1 FY20', timing: 'AMC',
    epsEst: 0.95, epsActual: 0.88, epsSurprise: -7.4,
    revEst: 2.9, revActual: 2.2, revSurprise: -24.1,
    impliedMove: 7.1, actualMove: -15.3, absMove: 15.3, direction: 'down',
    ivBefore: 68, ivAfter: 56, ivCrush: -17.6,
    startPrice: 174.55, endPrice: 147.88,
    beatType: 'double_miss', guidance: 'lowered',
    vix: 16.7, marketTrend: 'neutral',
    excluded: true, excludeReason: 'Crypto mining demand collapse overlapping China trade-war escalation · dual macro shock',
    analogueScore: 14, note: ''
  }
];

// Pre-computed aggregate price paths (T-5 to T+10, indexed to 0% at T0 close-to-T+1 open)
// Based on 21 non-excluded events. All values are % return relative to T0.
const PRICE_DAYS = [-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10];

const pricePaths = {
  median:  [0.0, 0.3, 0.6, 0.9, 1.2, 1.4, 8.3, 8.6, 8.8, 8.7, 8.5, 8.3, 8.1, 7.9, 7.8, 7.6],
  p25:     [-1.5,-1.2,-0.9,-0.5,-0.2, 0.0, 3.0, 3.3, 3.2, 3.0, 2.8, 2.6, 2.4, 2.3, 2.1, 1.9],
  p75:     [1.8, 2.2, 2.6, 3.0, 3.3, 3.5,15.2,15.7,16.0,15.8,15.5,15.2,14.9,14.6,14.3,14.0],
  current: [-0.5,-0.1, 0.4, 0.9, 1.4, null,null,null,null,null,null,null,null,null,null,null]
};

// IV paths (T-30 to T+10)
const IV_DAYS_PRE  = [-30,-25,-20,-15,-10,-8,-6,-5,-4,-3,-2,-1, 0];
const IV_DAYS_POST = [0, 1, 2, 3, 4, 5, 7, 10];

const ivPaths = {
  preMedian:    [42, 43, 44, 45, 47, 49, 51, 52, 54, 57, 61, 65, 68],
  preP25:       [37, 38, 38, 39, 40, 42, 43, 44, 45, 48, 52, 56, 59],
  preP75:       [48, 49, 51, 52, 54, 57, 60, 62, 64, 67, 71, 76, 81],
  preCurrent:   [45, 46, 47, 48, 50, 52, 55, 57, 59, 62, 65, 67, 68],
  postMedian:   [68, 40, 37, 35, 34, 33, 32, 31],
  postP25:      [59, 33, 30, 28, 27, 26, 25, 24],
  postP75:      [81, 50, 47, 44, 43, 42, 40, 39],
  postCurrent:  [68, null, null, null, null, null, null, null]
};

// Histogram bins for actual move distribution
const moveHistBins = [
  { label: '< −10%', min: -Infinity, max: -10, color: '#C24443' },
  { label: '−10 to −7%', min: -10, max: -7, color: '#C24443' },
  { label: '−7 to −5%', min: -7, max: -5, color: '#C24443' },
  { label: '−5 to −3%', min: -5, max: -3, color: '#C24443' },
  { label: '−3 to 0%', min: -3, max: 0, color: '#C24443' },
  { label: '0 to +3%', min: 0, max: 3, color: '#2F8F63' },
  { label: '+3 to +5%', min: 3, max: 5, color: '#2F8F63' },
  { label: '+5 to +7%', min: 5, max: 7, color: '#2F8F63' },
  { label: '+7 to +10%', min: 7, max: 10, color: '#2F8F63' },
  { label: '> +10%', min: 10, max: Infinity, color: '#2F8F63' }
];

// Price return summary table data
const priceSummaryData = [
  { window: 'T0 Close → T+1 Open', median: '+6.8%', mean: '+5.2%', p25: '+1.8%', p75: '+12.1%', pctPos: '71%', n: 21 },
  { window: 'T0 Close → T+1 Close', median: '+7.6%', mean: '+6.1%', p25: '+2.1%', p75: '+14.2%', pctPos: '71%', n: 21 },
  { window: 'T0 → T+3', median: '+7.9%', mean: '+6.4%', p25: '+2.3%', p75: '+14.9%', pctPos: '67%', n: 21 },
  { window: 'T0 → T+5', median: '+7.6%', mean: '+6.0%', p25: '+1.9%', p75: '+14.5%', pctPos: '67%', n: 21 },
  { window: 'T0 → T+10', median: '+7.2%', mean: '+5.8%', p25: '+1.5%', p75: '+13.8%', pctPos: '62%', n: 21 },
  { window: 'T0 → T+20', median: '+5.8%', mean: '+4.9%', p25: '+0.8%', p75: '+12.1%', pctPos: '57%', n: 18 }
];

// IV summary table data
const ivSummaryData = [
  { metric: 'Pre-event ATM IV (T0)', median: '65.2%', mean: '60.8%', p25: '51.4%', p75: '74.1%', n: 21 },
  { metric: 'Post-event ATM IV (T+1)', median: '39.8%', mean: '38.4%', p25: '31.2%', p75: '52.1%', n: 21 },
  { metric: 'IV Crush (T0→T+1)', median: '−38.4%', mean: '−36.7%', p25: '−42.1%', p75: '−29.8%', n: 21 },
  { metric: 'Event Premium (vol pts)', median: '26.1', mean: '24.8', p25: '18.2', p75: '34.7', n: 21 },
  { metric: 'Time to IV Normalization', median: '4.2 days', mean: '4.8 days', p25: '2.8 days', p75: '6.4 days', n: 19 },
  { metric: 'Pre-event IV Ramp (T-10→T0)', median: '+18.3%', mean: '+17.1%', p25: '+12.4%', p75: '+24.8%', n: 21 }
];

// Most comparable events (top 5 analogues)
const topAnalogues = [
  { id: 'E023', date: '2024-08-28', quarter: 'Q2 FY25', score: 94,
    similarities: ['High-IV environment (68%)', 'AMC timing', 'Bull market trend', 'AI-cycle earnings'],
    differences: ['Slightly lower implied move (8.2% vs 8.2%)'],
    actualMove: '+9.5%', ivCrush: '−39.7%' },
  { id: 'E020', date: '2023-11-21', quarter: 'Q3 FY24', score: 82,
    similarities: ['Similar IV level (65%)', 'Bull regime', 'AMC timing', 'Data center theme'],
    differences: ['Higher EPS surprise (19% vs est. 8%)'],
    actualMove: '+11.8%', ivCrush: '−38.5%' },
  { id: 'E022', date: '2024-05-22', quarter: 'Q1 FY25', score: 87,
    similarities: ['Very similar IV (62%)', 'Bull regime', 'AI demand theme'],
    differences: ['Move undershot implied (6.2% vs 7.4% implied)'],
    actualMove: '+6.2%', ivCrush: '−38.7%' },
  { id: 'E019', date: '2023-08-23', quarter: 'Q2 FY24', score: 78,
    similarities: ['Elevated IV (71%)', 'Bull trend', 'Semiconductor cycle expansion'],
    differences: ['Higher VIX at time', 'Larger EPS surprise (29%)'],
    actualMove: '+8.4%', ivCrush: '−38.0%' },
  { id: 'E005', date: '2020-02-13', quarter: 'Q4 FY20', score: 67,
    similarities: ['Low VIX environment', 'Strong beat', 'Raised guidance'],
    differences: ['Lower absolute IV (44%)', 'Pre-COVID cycle', 'Lower implied move (6.2%)'],
    actualMove: '+7.2%', ivCrush: '−36.4%' }
];

// Descriptive statements (generated from data, never advisory)
const descriptiveStatements = [
  {
    text: 'The current implied move (±8.2%) is above 72% of comparable historical events in this sample.',
    source: 'implied-move', n: 21, sample: '2019–2024'
  },
  {
    text: 'Actual move exceeded the implied move in 9 of 20 comparable events (45%). The remaining 11 events (55%) moved less than implied.',
    source: 'beat-rate', n: 20, sample: '2019–2024 (excl. 2 COVID/crypto outliers, 1 pending confirmation)'
  },
  {
    text: 'Current ATM IV (68.4%) sits at the 72nd percentile of pre-event IV readings in this sample — above the median (65.2%) but below the 75th percentile (74.1%).',
    source: 'atm-iv', n: 21, sample: '2019–2024'
  },
  {
    text: 'Median IV crush across 21 comparable events was −38.4% (T0→T+1). The current event premium of 34.2 vol points is 8.1 pts above the sample median of 26.1 pts.',
    source: 'iv-crush', n: 21, sample: '2019–2024'
  },
  {
    text: 'Of 15 "double beat" events in the sample, 12 (80%) showed a positive T+1 close. Of 6 events with lowered guidance, 5 (83%) showed a negative T+1 close.',
    source: 'beat-rate', n: 21, sample: '2019–2024'
  }
];

// Methodology definitions
const methodology = {
  'implied-move': {
    title: 'Implied Move Methodology',
    body: `The implied move (±8.2%) is derived from the ATM straddle price of the nearest weekly expiry overlapping the event date (Nov 22, 2024). Method: (Call + Put) / Underlying price, using mid-quote prices as of market close. This approximates but does not precisely equal the market-implied probability distribution. An alternative model-derived distribution is in development (Phase 1).

Limitations: (1) Uses mid-quote, which may be wider than tradable bid-ask in illiquid conditions. (2) Does not account for dividends. (3) The straddle includes time value through expiry, not just the event day.`,
    source: 'ATM straddle · NVDA Nov 22 expiry · mid-quote as of Nov 18, 2024 close',
    sampleSize: 'N/A (current market price)'
  },
  'actual-move': {
    title: 'Actual Move Methodology',
    body: `The actual move is measured as the percentage change from the T0 close to the T+1 close (previous session close before event to next trading session close after event announcement). Signed values reflect direction; absolute values are used for implied-vs-actual comparison.

For after-market events: T0 = session close before announcement. T+1 = next regular session close. Extended-hours price action is visible in Price Impact but not used in the primary measurement.

Excludes 2 observations: COVID-19 market dislocation (VIX > 60, structural break) and the 2019 crypto mining collapse (concurrent China trade-war escalation overlapping shock).`,
    source: 'Daily OHLCV · T0 close → T+1 close',
    sampleSize: 'N=21 (of 23 total; 2 excluded)'
  },
  'atm-iv': {
    title: 'ATM IV Methodology',
    body: `ATM IV is the implied volatility of the at-the-money option (delta closest to 0.50 call, or the strike nearest the spot price). Uses the nearest weekly expiry that overlaps the event date for the event-day reading.

Constant-maturity IV uses a simple linear interpolation between the two nearest expirations to produce a 30-day constant maturity series for trend comparison. Full methodology for constant-maturity interpolation is detailed in the Implied Volatility tab.

IV rank and percentile are calculated over the 252-trading-day rolling window.`,
    source: 'Option chain · mid-quote · 30-day constant maturity interpolation',
    sampleSize: 'N=21 historical readings; 252-day window for rank/percentile'
  },
  'iv-crush': {
    title: 'IV Crush Methodology',
    body: `IV crush is the percentage change in ATM IV from T0 (session before event) to T+1 (next session after event announcement).

The event premium (vol points) is the difference between the event-expiry ATM IV and the next-expiry ATM IV, expressed in percentage-point volatility units. A higher event premium indicates the market is assigning more relative premium to the event expiry.

Time to normalization is defined as the number of trading days from T+1 until ATM IV (constant maturity) returns within 10% of its pre-event-cycle baseline (60-day lagged average).`,
    source: 'ATM IV · event-expiry and next-expiry · T0 close → T+1 close',
    sampleSize: 'N=21 (T0→T+1 crush); N=19 (normalization, 2 recent events pending)'
  },
  'beat-rate': {
    title: 'Implied vs. Actual Move Comparison',
    body: `"Actual > Implied" counts events where the absolute actual move (|T0 close → T+1 close|) exceeded the pre-event implied move derived from the ATM straddle of the event expiry. Both values are recorded as of T0 close.

This comparison is purely descriptive. A higher historical realized frequency does not imply that the current implied move is mis-priced, and should not be read as a directional recommendation. Multiple factors affect realized vs. implied outcomes including event quality, macro context, and options market structure.

Sample: 20 events with confirmed implied-move and actual-move data. 3 events excluded: 2 structural outliers, 1 pending current-event confirmation.`,
    source: 'ATM straddle implied move vs. T0→T+1 absolute return',
    sampleSize: 'N=20 (3 excluded from this comparison)'
  },
  'continuation': {
    title: 'Continuation Rate Methodology',
    body: `Continuation rate is the percentage of events where NVDA's T+1-to-T+5 return extended in the same direction as the T0→T+1 move. Measured on a raw (not benchmark-adjusted) basis.

Definition: For events with a positive T0→T+1 move, "continuation" is defined as T+5 close > T+1 close. For events with a negative T0→T+1 move, "continuation" is T+5 close < T+1 close.

The current reported rate (73%) applies only to the 15 double-beat events in the sample with raised or maintained guidance. The full-sample continuation rate including misses is 57%.`,
    source: 'Daily close prices · T+1 to T+5 directional persistence',
    sampleSize: 'N=15 (double-beat subsample); N=21 (full sample: 57%)'
  },
  'prob-lens': {
    title: 'Implied Probability Lens — Methodology',
    body: `The implied probability translation converts the ATM straddle implied move to an approximate probability of exceeding that threshold at expiry.

Derivation: For a straddle-implied move of ±M%, the probability of the underlying exceeding |±M%| by expiry approximates 1 − 2×N(d2) under a lognormal model with constant volatility, where N() is the standard normal CDF. For a ±8.2% implied move on a 2-day expiry, this yields approximately 33%.

The realized frequency (45%) counts the fraction of historical comparable events where the absolute actual move exceeded the current implied move threshold (±8.2%). This is not the same calculation — it uses a discrete historical frequency vs. a continuous theoretical distribution.

The "gap" between 33% implied and 45% realized is reported as an observation. It does not constitute evidence that the current implied price is incorrect. Sampling variation, regime differences, and the non-stationarity of the sample contribute to historical frequency deviations from implied probabilities.`,
    source: 'ATM straddle · lognormal approximation · discrete historical frequency',
    sampleSize: 'Implied: current market price. Realized: N=20 comparable events.'
  }
};
