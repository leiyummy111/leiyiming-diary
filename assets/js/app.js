/* ==========================================================================
   app.js · 页面渲染与交互
   ========================================================================== */

/* ---------------- 通用小工具 ---------------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let toastTimer;
function Toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

function Modal(html) {
  $('#modalBox').innerHTML = html;
  $('#modalMask').classList.add('show');
}
function closeModal() { $('#modalMask').classList.remove('show'); }
$('#modalMask').addEventListener('click', e => { if (e.target.id === 'modalMask') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ---------------- 导航 ---------------- */
const NAV = [
  { k: 'home', e: '🏠', n: '今天' },
  { k: 'record', e: '✍️', n: '记录' },
  { k: 'insight', e: '📊', n: '洞察' },
  { k: 'care', e: '🌿', n: '关怀' },
  { k: 'diary', e: '📖', n: '日记' },
  { k: 'chat', e: '💬', n: '陪伴' }
];
let currentPage = 'home';

function renderNav() {
  $('#navList').innerHTML = NAV.map(x =>
    `<button class="nav-item${x.k === currentPage ? ' active' : ''}" data-page="${x.k}"><span class="ico">${x.e}</span>${x.n}</button>`
  ).join('');
  $('#tabbar').innerHTML = NAV.map(x =>
    `<button class="${x.k === currentPage ? 'on' : ''}" data-page="${x.k}"><span class="ico">${x.e}</span>${x.n}</button>`
  ).join('');
}
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-page]');
  if (btn) { go(btn.dataset.page); return; }
  const item = e.target.closest('[data-id]');
  if (item) { openEntry(item.dataset.id); return; }
  const goBtn = e.target.closest('[data-go]');
  if (goBtn) go(goBtn.dataset.go);
});

function go(p) {
  currentPage = p;
  $$('.page').forEach(s => s.classList.toggle('active', s.id === 'page-' + p));
  renderNav();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (p === 'insight') renderInsight();
  if (p === 'diary') renderDiary();
  if (p === 'home') renderHome();
  if (p === 'record') renderRecord();
  if (p === 'care') renderCare();
  if (p === 'chat') initChat();
  location.hash = '#' + p;
}

/* ==========================================================================
   首页
   ========================================================================== */
let homeRange = 7;

function renderHome() {
  const entries = Store.entries();
  const now = new Date();
  const h = now.getHours();
  const hello = h < 6 ? '还没睡呀' : h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : h < 23 ? '晚上好' : '夜深了';
  $('#greetTitle').textContent = `${hello}，欢迎回到小岛 🏝️`;
  $('#greetSub').textContent = entries.length ? '你的情绪都在这里被好好收着。' : '先记录一次，小岛就能开始认识你了。';
  $('#heroDate').textContent = `${now.getMonth() + 1} 月 ${now.getDate()} 日 · ${dayLabel(now)}`;

  const today = entries.filter(e => new Date(e.t).toDateString() === now.toDateString());
  const last = entries[0];
  $('#heroTitle').textContent = today.length
    ? '今天已经记下过心情了，想再补一笔吗？'
    : '今天，你的心里是什么天气？';
  $('#heroText').textContent = today.length
    ? `最近一次记录：${moodOf(last.mood).n}，${relativeTime(last.t)}。随时可以回来补充。`
    : '花 30 秒记录此刻的感受，让情绪被看见。写下它，就是照顾自己的第一步。';
  $('#heroMood').textContent = today.length ? moodOf(today[0].mood).e : (last ? moodOf(last.mood).e : '—');
  const streak = Stats.streak(entries);
  $('#heroStreak').textContent = streak;
  $('#sideStreak').textContent = streak;
  $('#sideTotal').textContent = entries.length;
  const a7 = Stats.avg(7, entries);
  $('#heroAvg').textContent = a7 ? a7.toFixed(1) : '—';

  // 情绪稳定度：100 - 波动*20，结合均值
  const vol = Stats.volatility(30, entries);
  const avg30 = Stats.avg(30, entries) || 5;
  const stable = Math.max(10, Math.min(100, Math.round(100 - vol * 18 + (avg30 - 5) * 4)));
  $('#statStable').innerHTML = stable + '<small>/100</small>';
  const prevStable = localStorage.getItem('moodisle.stable');
  if (prevStable) {
    const d = stable - (+prevStable);
    $('#statStableTrend').innerHTML = `<span class="${d >= 0 ? 'up' : 'down'}">${d >= 0 ? '↑' : '↓'} ${Math.abs(d)}</span> 相比上次`;
  } else $('#statStableTrend').textContent = '波动越小分数越高';
  localStorage.setItem('moodisle.stable', stable);

  const monthCount = entries.filter(e => {
    const d = new Date(e.t);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  $('#statMonth').innerHTML = monthCount + '<small>篇</small>';
  $('#statMonthTrend').textContent = `共 ${entries.length} 篇 · 连续 ${streak} 天`;

  const tr = Stats.triggerRank(30, entries);
  $('#statTrigger').textContent = tr.length ? triggerName(tr[0].k) : '—';
  $('#statTriggerTrend').textContent = tr.length ? `出现 ${tr[0].n} 次 · 均值 ${tr[0].avg.toFixed(1)}` : '近 30 天统计';
  const cc = Store.careCount();
  $('#statCare').innerHTML = cc + '<small>次</small>';
  $('#statCareTrend').textContent = cc ? '每一次都是照顾自己的证据' : '去「关怀」页完成第一个练习';

  // 曲线
  Charts.line($('#homeChart'), Stats.daily(homeRange, entries), { height: 220 });

  // 触发 Top5
  const top5 = tr.slice(0, 5);
  const max = top5.length ? top5[0].n : 1;
  $('#homeTriggers').innerHTML = top5.length ? top5.map(x => `
    <div class="bar-row">
      <div class="bar-top"><span>${esc(triggerName(x.k))}</span><span style="color:var(--ink-400)">${x.n} 次 · 均值 ${x.avg.toFixed(1)}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(x.n / max * 100).toFixed(0)}%"></div></div>
    </div>`).join('') : `<div class="empty"><div class="em">🎯</div><p>还没有触发因素数据</p></div>`;

  // AI 观察
  renderHomeAI(entries);

  // 此刻推荐
  const base = last ? last.mood : 'calm';
  const plans = AI.recommend(base, last ? last.intensity : 5, last ? last.triggers : []);
  $('#homeCare').innerHTML = plans.slice(0, 3).map(p => `
    <div class="sound-card" data-plan="${p.id}" data-mood="${base}" style="margin-bottom:8px">
      <div class="em">${p.em}</div>
      <div><div class="nm">${p.title}</div><div class="ds">${p.dur} · ${esc(p.desc.slice(0, 22))}…</div></div>
      <div class="eq"><i></i><i></i><i></i><i></i></div>
    </div>`).join('');
}

function renderHomeAI(entries) {
  const list = AI.insights(entries, 14);
  const pool = list.slice(1);
  const pickOne = pool[Math.floor(Math.random() * pool.length)] || list[0];
  const a7 = Stats.avg(7, entries), a14 = Stats.avg(14, entries);
  let txt = '';
  if (a7 !== null && a14 !== null) {
    const d = a7 - a14;
    txt += `最近 7 天你的情绪均值是 <b>${a7.toFixed(1)}</b>，${d >= 0.3 ? '比前一周<b class="up">回升</b>了一些，看起来你在慢慢找回节奏。' : d <= -0.3 ? '比前一周<b class="down">略低</b>，可能最近消耗比较大，先别对自己要求太高。' : '和前一周基本持平，状态比较稳定。'}`;
  } else txt = '记录得越多，我能告诉你的就越准。';
  if (pickOne) txt += `<br><br>${pickOne.tx}`;
  $('#homeAiText').innerHTML = txt;

  const last = entries[0];
  const moodKey = last ? last.mood : 'calm';
  $('#homeAiActions').innerHTML = [
    ['✍️ 补充一条记录', 'record'],
    ['🫁 3 分钟呼吸', 'care'],
    ['📊 看完整分析', 'insight'],
    ['💬 找小岛聊聊', 'chat']
  ].map(([n, p]) => `<button class="btn btn-ghost btn-sm" data-go="${p}">${n}</button>`).join('');
}

/* ==========================================================================
   记录页
   ========================================================================== */
let draft = { mood: null, intensity: 5, triggers: [] };

function renderRecord() {
  // 情绪选择器
  const groups = [
    { t: '愉悦', g: 'up' }, { t: '复杂/平静', g: 'mid' }, { t: '低落', g: 'down' },
    { t: '焦虑', g: 'anxious' }, { t: '愤怒', g: 'angry' }
  ];
  let html = '';
  groups.forEach(gp => {
    const ms = MOODS.filter(m => m.g === gp.g);
    if (!ms.length) return;
    html += `<div style="grid-column:1/-1;font-size:11px;color:var(--ink-300);margin:6px 0 2px">${gp.t}</div>`;
    html += ms.map(m => `
      <button class="mood-chip${draft.mood === m.k ? ' on' : ''}" data-mood="${m.k}" title="${m.n} · 效价 ${m.v}">
        <span class="em">${m.e}</span><span class="lb">${m.n}</span>
      </button>`).join('');
  });
  $('#moodPicker').innerHTML = html;

  // 触发因素
  $('#triggerTags').innerHTML = TRIGGERS.map(t =>
    `<button class="tag${draft.triggers.includes(t.k) ? ' on' : ''}" data-trigger="${t.k}">${t.n}</button>`
  ).join('');

  renderTodayList();
}

function renderTodayList() {
  const now = new Date();
  const today = Store.entries().filter(e => new Date(e.t).toDateString() === now.toDateString());
  $('#todayCount').textContent = today.length + ' 条';
  $('#todayList').innerHTML = today.length ? today.map(e => {
    const m = moodOf(e.mood);
    return `<div class="diary-item" data-id="${e.id}">
      <div class="diary-dot" style="background:${m.c}22">${m.e}</div>
      <div class="diary-body">
        <div class="diary-head"><span class="mood">${m.n}</span>
          <span class="mini-tag">强度 ${e.intensity}</span>
          <span class="time">${relativeTime(e.t)}</span></div>
        <div class="diary-text">${esc(e.text || '（未填写文字）')}</div>
      </div>
    </div>`;
  }).join('') : `<div class="empty" style="padding:26px"><div class="em">🕊️</div><p>今天还没有记录</p></div>`;
}

/* 实时分析 */
function liveAnalyze() {
  const text = $('#diaryText').value;
  if (!draft.mood && !text.trim()) {
    $('#liveAi').innerHTML = '选择情绪或写下文字后，这里会实时给出情绪判断、可能的触发因素与调节方向。';
    $('#liveMeta').innerHTML = '';
    return;
  }
  const mood = draft.mood || 'calm';
  const an = AI.analyze({ mood, intensity: draft.intensity, triggers: draft.triggers, text });
  const hits = an.auto;
  let s = '';
  if (draft.mood) {
    s += `识别到情绪：<b>${an.mood.e} ${an.mood.n}</b>，强度 <b>${an.level}</b>（${draft.intensity}/10）。`;
    s += an.mood.v >= 6.5 ? ' 状态不错，值得记下来。' : ' 这种感觉被你看见了，就已经在处理了。';
  }
  if (hits.length) {
    s += `<br><br>文字里读到的触发线索：<b>${hits.map(h => h.n).join('、')}</b>。`;
  } else if (draft.triggers.length) {
    s += `<br><br>你标记的触发因素：<b>${draft.triggers.map(triggerName).join('、')}</b>。`;
  }
  if (an.dist) {
    s += `<br><br>⚠️ 思维习惯提示 — <b>${an.dist.name}</b>：${an.dist.tip}`;
  }
  $('#liveAi').innerHTML = s;

  const plans = AI.recommend(mood, draft.intensity, draft.triggers.concat(hits.map(h => h.k)));
  $('#liveMeta').innerHTML = `<div style="font-size:11.5px;color:var(--ink-400);margin-bottom:6px">推荐方向</div>` +
    plans.slice(0, 2).map(p => `<div class="mini-tag" style="display:inline-block;margin:0 6px 6px 0;padding:6px 11px;font-size:11.5px">${p.em} ${p.title}</div>`).join('');
}

/* ==========================================================================
   洞察页
   ========================================================================== */
let insightRange = 30;

function renderInsight() {
  const entries = Store.entries();
  const days = insightRange;
  const avg = Stats.avg(days, entries);
  $('#insAvg').textContent = avg ? avg.toFixed(1) : '—';
  const vol = Stats.volatility(days, entries);
  $('#insVol').textContent = vol ? vol.toFixed(1) : '—';
  $('#insVolTrend').textContent = vol > 2.2 ? '波动偏大' : vol > 1.2 ? '中等波动' : '比较平稳';
  $('#insAvgTrend').textContent = avg ? (avg >= 7 ? '整体愉悦' : avg >= 5.5 ? '整体平稳' : avg >= 4 ? '偏低落' : '明显低落') : '暂无数据';

  const daily = Stats.daily(days, entries).filter(d => d.items.length);
  if (daily.length) {
    const best = daily.slice().sort((a, b) => b.score - a.score)[0];
    const worst = daily.slice().sort((a, b) => a.score - b.score)[0];
    $('#insBest').textContent = `${fmtDate(best.date)} ${moodOf(best.items[0].mood).e}`;
    $('#insBestTrend').textContent = `情绪值 ${best.score.toFixed(1)} · ${best.items.map(i => moodOf(i.mood).n).join('、')}`;
    $('#insWorst').textContent = `${fmtDate(worst.date)} ${moodOf(worst.items[0].mood).e}`;
    $('#insWorstTrend').textContent = `情绪值 ${worst.score.toFixed(1)} · ${worst.items.map(i => moodOf(i.mood).n).join('、')}`;
  } else {
    $('#insBest').textContent = $('#insWorst').textContent = '—';
  }

  Charts.line($('#trendChart'), Stats.daily(days, entries), { height: 250 });

  const mr = Stats.moodRank(days, entries).slice(0, 7);
  const donutData = mr.map(([k, n]) => [moodOf(k).n, n, moodOf(k).c]);
  Charts.donut($('#donutChart'), donutData);
  const total = donutData.reduce((a, d) => a + d[1], 0) || 1;
  $('#donutLegend').innerHTML = donutData.map(d =>
    `<span><i style="background:${d[2]}"></i>${d[0]} ${d[1]} 次 · ${(d[1] / total * 100).toFixed(0)}%</span>`).join('');

  const tr = Stats.triggerRank(days, entries).slice(0, 8);
  const max = tr.length ? tr[0].n : 1;
  $('#triggerBars').innerHTML = tr.length ? tr.map(x => `
    <div class="bar-row" data-tfilter="${x.k}" style="cursor:pointer">
      <div class="bar-top"><span>${esc(triggerName(x.k))}</span>
        <span style="color:var(--ink-400)">${x.n} 次 · 均值 ${x.avg.toFixed(1)}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(x.n / max * 100).toFixed(0)}%;background:linear-gradient(90deg,${x.avg < 4.5 ? '#B69BE0,#FF8FB4' : '#7C6BFF,#A78BFA'})"></div></div>
    </div>`).join('') : `<div class="empty"><div class="em">🎯</div><p>暂无触发因素数据</p></div>`;
  $$('#triggerBars [data-tfilter]').forEach(el => {
    el.onclick = () => { openEntriesByTrigger(el.dataset.tfilter); };
  });

  Charts.weekHeat($('#weekHeat'), Stats.weekHeat(entries));
  Charts.calendar($('#calHeat'), entries);

  $('#insightList').innerHTML = AI.insights(entries, days).map(x =>
    `<div class="insight-item"><div class="ic">${x.ic}</div><div class="tx">${x.tx}</div></div>`).join('');
}

function openEntriesByTrigger(k) {
  const list = Store.entries().filter(e => (e.triggers || []).includes(k));
  Modal(`
    <button class="modal-close" onclick="closeModal()">✕</button>
    <h3>与「${esc(triggerName(k))}」相关的记录</h3>
    <div class="m-sub">共 ${list.length} 条 · 平均情绪值 ${list.length ? (list.reduce((a, e) => a + Stats.score(e), 0) / list.length).toFixed(1) : '—'}</div>
    ${list.slice(0, 12).map(e => {
      const m = moodOf(e.mood);
      return `<div class="diary-item" data-id="${e.id}" style="margin-bottom:8px">
        <div class="diary-dot" style="background:${m.c}22">${m.e}</div>
        <div class="diary-body">
          <div class="diary-head"><span class="mood">${m.n}</span><span class="time">${fmtDate(e.t, true)}</span></div>
          <div class="diary-text">${esc(e.text || '（未填写文字）')}</div>
        </div></div>`;
    }).join('')}
  `);
}

/* ==========================================================================
   关怀页
   ========================================================================== */
let careMood = null;
let breathTimer = null, breathState = null;
const BREATH_PATTERNS = {
  '478': { name: '4-7-8 放松呼吸', phases: [['吸气', 4], ['屏息', 7], ['呼气', 8]], tip: '吸气 4 秒 · 屏息 7 秒 · 呼气 8 秒' },
  'box': { name: '箱式呼吸 4-4-4-4', phases: [['吸气', 4], ['屏息', 4], ['呼气', 4], ['屏息', 4]], tip: '四段等长，给大脑稳定的节奏' },
  'calm': { name: '舒缓呼吸 5-5', phases: [['吸气', 5], ['呼气', 5]], tip: '等长呼吸，随时可用' }
};
let breathMode = '478';

function renderCare() {
  const entries = Store.entries();
  const last = entries[0];
  if (!careMood) careMood = last ? last.mood : 'calm';

  $('#careMoodSeg').innerHTML = MOODS.filter(m => ['happy', 'calm', 'down', 'anxious', 'angry'].includes(m.k))
    .map(m => `<button data-care-mood="${m.k}" class="${careMood === m.k ? 'on' : ''}">${m.e} ${m.n}</button>`).join('');
  $$('#careMoodSeg [data-care-mood]').forEach(b => b.onclick = () => { careMood = b.dataset.careMood; renderCare(); });

  const m = moodOf(careMood);
  $('#careFor').textContent = m.e + ' ' + m.n;

  const plans = AI.recommend(careMood, 6, last ? last.triggers : []);
  $('#careRecs').innerHTML = plans.map(p => `
    <div class="care-card" data-plan="${p.id}">
      <div class="blob" style="background:${m.c}"></div>
      <div class="em">${p.em}</div>
      <h4>${p.title}</h4>
      <p>${esc(p.desc)}</p>
      <div class="meta">${p.dur} · 点击开始 →</div>
    </div>`).join('');

  const music = AI.MUSIC[m.g] || AI.MUSIC.mid;
  $('#musicList').innerHTML = music.map(x => `
    <div class="sound-card" style="cursor:default">
      <div class="em">🎧</div>
      <div style="flex:1"><div class="nm">${esc(x.t)}</div>
        <div class="ds">${esc(x.d)}</div>
        <div class="ds" style="margin-top:3px;color:var(--brand-600)">${esc(x.q)} · ${esc(x.plat)}</div></div>
    </div>`).join('');

  const sport = AI.SPORT[m.g] || AI.SPORT.mid;
  $('#sportList').innerHTML = sport.map(x => `
    <div class="sound-card" style="cursor:default">
      <div class="em">💪</div>
      <div style="flex:1"><div class="nm">${esc(x.t)}</div>
        <div class="ds">${esc(x.d)}</div>
        <div class="mini-tag" style="margin-top:5px;display:inline-block">${esc(x.k)}</div></div>
    </div>`).join('');

  // 冥想时长
  const durs = [3, 5, 10, 15];
  $('#medDurations').innerHTML = durs.map(d =>
    `<button class="tag${medDuration === d ? ' on' : ''}" data-med="${d}">${d} 分钟</button>`).join('');
  $$('#medDurations [data-med]').forEach(b => b.onclick = () => { medDuration = +b.dataset.med; renderCare(); });

  renderSounds();

  // 危机提示
  const low7 = Stats.recent(7, entries).filter(e => Stats.score(e) < 3.5);
  const sos = $('#sosBox');
  if (low7.length >= 4) {
    sos.style.display = 'block';
    sos.innerHTML = `🫂 <b>想轻轻提醒你：</b>最近 7 天有 ${low7.length} 条记录显示你处在明显低落里。自我关怀很重要，但它不能替代专业的支持。如果这种状态持续两周以上、已经影响到睡眠、饮食或日常，请考虑联系心理咨询师或就医。全国 24 小时心理援助热线 <b>12356</b>，北京心理危机干预中心 <b>010-82951332</b>。你值得被好好照顾。`;
  } else sos.style.display = 'none';
}

/* 呼吸练习 */
function startBreath() {
  if (breathTimer) { stopBreath(); return; }
  const p = BREATH_PATTERNS[breathMode];
  $('#breathName').textContent = p.name;
  $('#breathTip').textContent = p.tip;
  $('#btnBreath').textContent = '暂停';
  breathState = { i: 0, left: p.phases[0][1], cycles: 0 };
  tickBreath();
  breathTimer = setInterval(tickBreath, 1000);
}
function tickBreath() {
  const p = BREATH_PATTERNS[breathMode];
  const s = breathState;
  const [name, dur] = p.phases[s.i];
  $('#breathPhase').textContent = name;
  $('#breathSec').textContent = s.left;
  const core = $('#breathCore');
  const scale = name === '吸气' ? 1.18 : name === '呼气' ? 0.86 : (core.dataset.last === '吸气' ? 1.18 : 0.86);
  core.style.transform = `scale(${scale})`;
  if (name !== '屏息') core.dataset.last = name;
  s.left--;
  if (s.left <= 0) {
    s.i = (s.i + 1) % p.phases.length;
    if (s.i === 0) { s.cycles++; $('#breathCount').textContent = s.cycles; }
    s.left = p.phases[s.i][1];
    if (s.cycles === 4) { stopBreath(); Toast('4 轮完成，感觉怎么样？🌿'); Store.logCare('breath'); }
  }
}
function stopBreath() {
  clearInterval(breathTimer); breathTimer = null;
  $('#btnBreath').textContent = '开始';
  $('#breathPhase').textContent = '已暂停';
  $('#breathCore').style.transform = 'scale(1)';
}
$('#btnBreath').onclick = startBreath;
$$('[data-breath]').forEach(b => b.onclick = () => {
  breathMode = b.dataset.breath;
  const p = BREATH_PATTERNS[breathMode];
  $('#breathName').textContent = p.name;
  $('#breathTip').textContent = p.tip;
  if (breathTimer) { stopBreath(); startBreath(); }
});

/* 冥想计时 */
let medDuration = 5, medTimer = null, medLeft = 0;
$('#btnMed').onclick = () => {
  if (medTimer) return;
  medLeft = medDuration * 60;
  $('#medState').textContent = '闭上眼睛，跟着呼吸就好';
  medTimer = setInterval(() => {
    medLeft--;
    const mm = String(Math.floor(medLeft / 60)).padStart(2, '0');
    const ss = String(medLeft % 60).padStart(2, '0');
    $('#medTime').textContent = `${mm}:${ss}`;
    if (medLeft <= 0) {
      clearInterval(medTimer); medTimer = null;
      $('#medState').textContent = '完成啦，慢慢睁开眼睛 🌿';
      $('#medTime').textContent = '00:00';
      Store.logCare('meditation');
      Toast(`完成 ${medDuration} 分钟冥想，真棒 🧘`);
    }
  }, 1000);
};
$('#btnMedStop').onclick = () => {
  if (medTimer) { clearInterval(medTimer); medTimer = null; }
  $('#medState').textContent = '随时可以重新开始';
  $('#medTime').textContent = String(medDuration).padStart(2, '0') + ':00';
};

/* 环境音景（Web Audio 实时合成，无需音频文件） */
const SOUNDS = [
  { k: 'rain', e: '🌧️', n: '雨声', d: '窗外的雨，稳定而连续' },
  { k: 'wave', e: '🌊', n: '海浪', d: '一起一落的潮汐节律' },
  { k: 'forest', e: '🌲', n: '森林', d: '风穿过树叶与远处鸟鸣' },
  { k: 'night', e: '🌙', n: '夏夜', d: '低频虫鸣，适合入睡' },
  { k: 'cafe', e: '☕', n: '咖啡馆', d: '模糊人声与杯碟轻响' }
];
const Sound = {
  ctx: null, cur: null, nodes: [], timer: null,
  ensure() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  noiseBuffer(ctx, brown) {
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else d[i] = w;
    }
    return buf;
  },
  stop() {
    this.nodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} });
    this.nodes = [];
    clearInterval(this.timer); this.timer = null;
    this.cur = null;
  },
  play(kind) {
    this.ensure();
    this.stop();
    const ctx = this.ctx;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.5);

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx, kind !== 'rain');
    src.loop = true;
    const filt = ctx.createBiquadFilter();
    let lfo = null, lfoGain = null;

    if (kind === 'rain') { filt.type = 'bandpass'; filt.frequency.value = 1800; filt.Q.value = .6; }
    else if (kind === 'wave') { filt.type = 'lowpass'; filt.frequency.value = 700; filt.Q.value = .4; }
    else if (kind === 'forest') { filt.type = 'lowpass'; filt.frequency.value = 2400; }
    else if (kind === 'night') { filt.type = 'lowpass'; filt.frequency.value = 420; }
    else { filt.type = 'lowpass'; filt.frequency.value = 1100; }

    src.connect(filt);
    let lastNode = filt;

    if (kind === 'wave') {
      lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
      lfoGain = ctx.createGain(); lfoGain.gain.value = 0.5;
      const g = ctx.createGain(); g.gain.value = 0.5;
      lfo.connect(lfoGain); lfoGain.connect(g.gain);
      filt.connect(g); lastNode = g; lfo.start();
      this.nodes.push(lfo);
    }
    if (kind === 'cafe') {
      lfo = ctx.createOscillator(); lfo.frequency.value = 0.35;
      lfoGain = ctx.createGain(); lfoGain.gain.value = 0.25;
      const g = ctx.createGain(); g.gain.value = 0.5;
      lfo.connect(lfoGain); lfoGain.connect(g.gain);
      filt.connect(g); lastNode = g; lfo.start();
      this.nodes.push(lfo);
    }

    lastNode.connect(master);
    src.start();
    this.nodes.push(src);

    // 偶发点缀：鸟鸣 / 水滴
    if (kind === 'forest') {
      this.timer = setInterval(() => {
        if (Math.random() < .35) {
          const o = ctx.createOscillator(), g = ctx.createGain();
          const f = 1800 + Math.random() * 1400;
          o.type = 'sine'; o.frequency.setValueAtTime(f, ctx.currentTime);
          o.frequency.exponentialRampToValueAtTime(f * 1.5, ctx.currentTime + .12);
          g.gain.setValueAtTime(0, ctx.currentTime);
          g.gain.linearRampToValueAtTime(.08, ctx.currentTime + .05);
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + .35);
          o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime + .4);
        }
      }, 2600);
    }
    if (kind === 'night') {
      this.timer = setInterval(() => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'triangle'; o.frequency.value = 3200 + Math.random() * 600;
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(.03, ctx.currentTime + .02);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + .18);
        o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime + .2);
      }, 900);
    }
    this.cur = kind;
  }
};
function renderSounds() {
  $('#soundList').innerHTML = SOUNDS.map(s => `
    <div class="sound-card${Sound.cur === s.k ? ' on' : ''}" data-sound="${s.k}">
      <div class="em">${s.e}</div>
      <div style="flex:1"><div class="nm">${s.n}</div><div class="ds">${s.d}</div></div>
      <div class="eq"><i></i><i></i><i></i><i></i></div>
    </div>`).join('');
  $$('#soundList [data-sound]').forEach(el => {
    el.onclick = () => {
      const k = el.dataset.sound;
      if (Sound.cur === k) { Sound.stop(); Toast('已停止环境音'); }
      else { Sound.play(k); Toast(`播放：${SOUNDS.find(s => s.k === k).n} · 戴上耳机效果更好`); }
      renderSounds();
    };
  });
}

/* 练习弹窗 */
document.addEventListener('click', e => {
  const card = e.target.closest('[data-plan]');
  if (!card) return;
  const moodKey = card.dataset.mood || careMood || 'calm';
  const allPlans = AI.recommend(moodKey, 6, []);
  const p = allPlans.find(x => x.id === card.dataset.plan) ||
    Object.values(AI.PLANS).flat().find(x => x.id === card.dataset.plan);
  if (!p) return;
  Modal(`
    <button class="modal-close" onclick="closeModal()">✕</button>
    <div style="font-size:34px">${p.em}</div>
    <h3 style="margin-top:8px">${p.title}</h3>
    <div class="m-sub">${p.dur} · 为「${moodOf(moodKey).n}」推荐</div>
    <p style="font-size:13.5px;line-height:1.8;color:var(--ink-700)">${esc(p.desc)}</p>
    <div class="field-label"><span class="dotmark"></span> 这样做</div>
    <div class="stack" style="gap:8px">
      ${p.steps.map((s, i) => `<div class="sound-card" style="cursor:default">
        <div class="em" style="font-size:15px;width:24px;text-align:center;color:var(--brand-600);font-weight:700">${i + 1}</div>
        <div style="flex:1"><div class="nm" style="font-weight:500;font-size:13px">${esc(s)}</div></div>
      </div>`).join('')}
    </div>
    <button class="btn btn-primary btn-block" style="margin-top:18px" onclick="finishCare('${p.id}')">我完成了 ✓</button>
  `);
});
function finishCare(id) {
  Store.logCare(id);
  closeModal();
  Toast('已记入关怀记录，你正在好好照顾自己 🌿');
  renderHome();
}

/* ==========================================================================
   日记页
   ========================================================================== */
let diaryFilter = null, diaryKeyword = '';

function renderDiary() {
  const all = Store.entries();
  $('#diarySummary').textContent = all.length
    ? `共 ${all.length} 篇 · 连续记录 ${Stats.streak(all)} 天 · 平均情绪值 ${(all.reduce((a, e) => a + Stats.score(e), 0) / all.length).toFixed(1)}`
    : '还没有日记，写下第一篇吧。';

  $('#filterMoods').innerHTML =
    `<button class="tag${diaryFilter === null ? ' on' : ''}" data-filter="">全部</button>` +
    MOODS.filter(m => all.some(e => e.mood === m.k)).slice(0, 10)
      .map(m => `<button class="tag${diaryFilter === m.k ? ' on' : ''}" data-filter="${m.k}">${m.e} ${m.n}</button>`).join('');
  $$('#filterMoods [data-filter]').forEach(b => b.onclick = () => {
    diaryFilter = b.dataset.filter || null; renderDiary();
  });

  let list = all;
  if (diaryFilter) list = list.filter(e => e.mood === diaryFilter);
  if (diaryKeyword) {
    const k = diaryKeyword.toLowerCase();
    list = list.filter(e =>
      (e.text || '').toLowerCase().includes(k) ||
      moodOf(e.mood).n.includes(k) ||
      (e.triggers || []).some(t => triggerName(t).includes(k)));
  }

  if (!list.length) {
    $('#diaryList').innerHTML = `<div class="empty"><div class="em">🔍</div><p>没有匹配的日记</p></div>`;
    return;
  }

  // 按月分组
  const groups = {};
  list.forEach(e => {
    const d = new Date(e.t);
    const key = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;
    (groups[key] = groups[key] || []).push(e);
  });

  $('#diaryList').innerHTML = Object.entries(groups).map(([k, items]) => `
    <div style="font-size:12px;color:var(--ink-400);margin:8px 0 2px;padding-left:4px">${k} · ${items.length} 篇</div>
    ${items.map(e => {
      const m = moodOf(e.mood);
      return `<div class="diary-item" data-id="${e.id}">
        <div class="diary-dot" style="background:${m.c}26">${m.e}</div>
        <div class="diary-body">
          <div class="diary-head">
            <span class="mood">${m.n}</span>
            <span class="intensity-bar" title="强度 ${e.intensity}/10"><i style="width:${e.intensity * 10}%;background:${m.c}"></i></span>
            <span class="time">${fmtDate(e.t, true)}</span>
          </div>
          <div class="diary-text">${esc(e.text || '（未填写文字）')}</div>
          ${(e.triggers || []).length ? `<div class="diary-tags">${e.triggers.map(t => `<span class="mini-tag">${esc(triggerName(t))}</span>`).join('')}</div>` : ''}
        </div>
      </div>`;
    }).join('')}`).join('');
}

$('#searchInput').addEventListener('input', e => { diaryKeyword = e.target.value.trim(); renderDiary(); });

function openEntry(id) {
  const e = Store.entries().find(x => x.id === id);
  if (!e) return;
  const m = moodOf(e.mood);
  const an = AI.analyze(e);
  const plans = AI.recommend(e.mood, e.intensity, e.triggers);
  Modal(`
    <button class="modal-close" onclick="closeModal()">✕</button>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <div style="width:46px;height:46px;border-radius:15px;background:${m.c}26;display:grid;place-items:center;font-size:24px">${m.e}</div>
      <div><h3 style="margin:0">${m.n}</h3><div class="m-sub" style="margin:0">${fmtDate(e.t, true)} · ${dayLabel(e.t)}</div></div>
    </div>
    <div class="kv"><span class="k">情绪强度</span><span class="v">${e.intensity} / 10 · ${an.level}</span></div>
    <div class="kv"><span class="k">触发因素</span><span class="v">${(e.triggers || []).map(t => esc(triggerName(t))).join('、') || '未标记'}</span></div>
    ${an.auto.length ? `<div class="kv"><span class="k">文字中识别到</span><span class="v">${an.auto.map(a => esc(a.n)).join('、')}</span></div>` : ''}
    <p style="font-size:14px;line-height:1.85;color:var(--ink-800);margin:16px 0;padding:16px;background:var(--brand-50);border-radius:16px">${esc(e.text || '（没有写文字）')}</p>
    ${an.dist ? `<div class="ai-card" style="margin-bottom:14px">
      <div class="ai-head"><div class="ai-avatar">💡</div><div><h4>${an.dist.name}</h4><div class="tip">思维习惯提示</div></div></div>
      <div class="ai-text">${esc(an.dist.tip)}</div></div>` : ''}
    <div class="field-label"><span class="dotmark"></span> 当时可以试试</div>
    <div class="tag-wrap">${plans.slice(0, 3).map(p => `<button class="tag" data-plan="${p.id}" data-mood="${e.mood}">${p.em} ${p.title}</button>`).join('')}</div>
    <div style="display:flex;gap:10px;margin-top:20px">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">关闭</button>
      <button class="btn btn-ghost btn-sm" style="margin-left:auto;color:#D9536F" onclick="delEntry('${e.id}')">删除这条</button>
    </div>
  `);
}
function delEntry(id) {
  Store.remove(id); closeModal(); Toast('已删除');
  renderDiary(); renderHome(); renderRecord();
}
$('#btnExport').onclick = () => {
  const blob = new Blob([JSON.stringify(Store.data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `moodisle-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  Toast('已导出 JSON');
};
$('#btnImport').onclick = () => {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json';
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!d.entries) throw new Error('格式不符');
        Store.data = Object.assign({ entries: [], care: [], seeded: true }, d);
        Store.save(); Toast(`已导入 ${d.entries.length} 条记录`); renderAll();
      } catch (err) { Toast('导入失败：文件格式不正确'); }
    };
    r.readAsText(f);
  };
  inp.click();
};

/* ==========================================================================
   保存记录
   ========================================================================== */
$('#btnSave').onclick = () => {
  if (!draft.mood) { Toast('先选一个最靠近此刻的情绪吧 ☺️'); return; }
  const entry = {
    t: new Date().toISOString(),
    mood: draft.mood,
    intensity: draft.intensity,
    triggers: draft.triggers.slice(),
    text: $('#diaryText').value.trim()
  };
  Store.add(entry);
  const an = AI.analyze(entry);
  const plans = AI.recommend(entry.mood, entry.intensity, entry.triggers.concat(an.auto.map(a => a.k)));
  Modal(`
    <button class="modal-close" onclick="closeModal()">✕</button>
    <div style="font-size:32px">${an.mood.e}</div>
    <h3 style="margin-top:6px">已记下这份感受</h3>
    <div class="m-sub">小岛读到了这些 ——</div>
    <div class="kv"><span class="k">情绪</span><span class="v">${an.mood.n} · 强度 ${an.intensity}/10（${an.level}）</span></div>
    ${an.auto.length ? `<div class="kv"><span class="k">可能的触发因素</span><span class="v">${an.auto.map(a => esc(a.n)).join('、')}</span></div>` : ''}
    ${an.dist ? `<div class="kv"><span class="k">思维习惯</span><span class="v">${an.dist.name}</span></div>` : ''}
    ${an.dist ? `<p style="font-size:13px;line-height:1.8;color:var(--ink-600,var(--ink-700));margin-top:10px">${esc(an.dist.tip)}</p>` : ''}
    <div class="field-label"><span class="dotmark"></span> 现在可以做</div>
    <div class="tag-wrap">${plans.slice(0, 3).map(p => `<button class="tag" data-plan="${p.id}" data-mood="${entry.mood}">${p.em} ${p.title}</button>`).join('')}</div>
    <div style="display:flex;gap:10px;margin-top:20px">
      <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="closeModal()">好的</button>
      <button class="btn btn-ghost" data-go="care">去关怀页</button>
    </div>
  `);
  draft = { mood: null, intensity: 5, triggers: [] };
  $('#diaryText').value = ''; $('#intensity').value = 5; $('#intensityVal').textContent = '5 / 10';
  $('#charCount').textContent = '0';
  renderRecord(); renderHome();
};

$('#btnClear').onclick = () => {
  draft = { mood: null, intensity: 5, triggers: [] };
  $('#diaryText').value = ''; $('#intensity').value = 5; $('#intensityVal').textContent = '5 / 10';
  $('#charCount').textContent = '0';
  renderRecord(); liveAnalyze();
};

document.addEventListener('click', e => {
  const m = e.target.closest('[data-mood]');
  if (m && m.dataset.mood) { draft.mood = m.dataset.mood; renderRecord(); liveAnalyze(); return; }
  const t = e.target.closest('[data-trigger]');
  if (t) {
    const k = t.dataset.trigger;
    const i = draft.triggers.indexOf(k);
    if (i >= 0) draft.triggers.splice(i, 1); else draft.triggers.push(k);
    renderRecord(); liveAnalyze();
  }
});

$('#intensity').addEventListener('input', e => {
  draft.intensity = +e.target.value;
  $('#intensityVal').textContent = draft.intensity + ' / 10';
  liveAnalyze();
});
$('#diaryText').addEventListener('input', e => {
  $('#charCount').textContent = e.target.value.length;
  liveAnalyze();
});

/* 语音转写（Web Speech API，失败则提示手写） */
$('#btnVoice').onclick = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { Toast('当前浏览器不支持语音输入，直接打字也很好 ☺️'); return; }
  const r = new SR();
  r.lang = 'zh-CN'; r.interimResults = true;
  $('#btnVoice').textContent = '🎙️ 聆听中…';
  r.onresult = ev => {
    let txt = '';
    for (let i = 0; i < ev.results.length; i++) txt += ev.results[i][0].transcript;
    $('#diaryText').value = txt;
    $('#charCount').textContent = txt.length;
    liveAnalyze();
  };
  r.onend = () => { $('#btnVoice').textContent = '🎙️ 语音转写'; Toast('语音已转成文字，可以再改改'); };
  r.onerror = () => { $('#btnVoice').textContent = '🎙️ 语音转写'; Toast('没听清，要不直接打字？'); };
  r.start();
};

/* ==========================================================================
   AI 陪伴
   ========================================================================== */
const QUICKS = ['今天有点累，说不上为什么', '我在焦虑明天的汇报', '感觉自己什么都做不好', '刚刚发生了件开心的事', '睡不着，脑子停不下来'];
let chatInited = false;

function initChat() {
  if (chatInited) return;
  chatInited = true;
  $('#quickRow').innerHTML = QUICKS.map(q => `<button class="tag" data-quick="${esc(q)}">${esc(q)}</button>`).join('');
  $$('#quickRow [data-quick]').forEach(b => b.onclick = () => { $('#chatInput').value = b.dataset.quick; send(); });
  const entries = Store.entries();
  const last = entries[0];
  const greet = last
    ? `我看到你最近一次记录是「${moodOf(last.mood).e} ${moodOf(last.mood).n}」，${relativeTime(last.t)}。想聊聊那时候发生了什么吗？也可以说点别的，我在听。`
    : '你好，我是小岛 🌿 这里没有评判，也不用组织语言——想到什么就说什么，哪怕是「我不知道该说什么」也可以。';
  pushAI(greet);
}
document.addEventListener('click', e => {
  const q = e.target.closest('[data-quick]');
  if (q) { $('#chatInput').value = q.dataset.quick; send(); }
});
$('#btnSend').onclick = send;
$('#chatInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
});

function pushAI(text) {
  const log = $('#chatLog');
  const d = document.createElement('div');
  d.className = 'bubble ai';
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
  // 打字机
  let i = 0;
  d.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
  setTimeout(() => {
    const timer = setInterval(() => {
      i += 2;
      d.innerHTML = text.slice(0, i);
      log.scrollTop = log.scrollHeight;
      if (i >= text.length) clearInterval(timer);
    }, 18);
  }, 450);
}

function send() {
  const inp = $('#chatInput');
  const msg = inp.value.trim();
  if (!msg) return;
  const log = $('#chatLog');
  const mine = document.createElement('div');
  mine.className = 'bubble me';
  mine.textContent = msg;
  log.appendChild(mine);
  inp.value = '';
  log.scrollTop = log.scrollHeight;

  const ctx = {
    recentTriggers: Stats.triggerRank(14, Store.entries()).slice(0, 3).map(t => t.k)
  };
  setTimeout(() => pushAI(AI.chat(msg, ctx)), 300);
}

/* ==========================================================================
   示例数据 / 初始化
   ========================================================================== */
$('#btnSample').onclick = () => {
  const has = Store.data.seeded;
  Modal(`
    <button class="modal-close" onclick="closeModal()">✕</button>
    <h3>${has ? '管理示例数据' : '载入示例数据'}</h3>
    <div class="m-sub">示例数据用于展示图表与洞察效果，随时可以一键清除，不会影响你自己的记录方式。</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
      <button class="btn btn-primary btn-sm" onclick="loadSample()">${has ? '重新生成 60 天示例' : '生成 60 天示例'}</button>
      <button class="btn btn-ghost btn-sm" onclick="clearSample()">只清除示例数据</button>
      <button class="btn btn-ghost btn-sm" style="color:#D9536F" onclick="clearAll()">清空全部记录</button>
    </div>
  `);
};
function loadSample() {
  const mine = Store.data.entries.filter(e => !e.sample);
  Store.seed();
  Store.data.entries = Store.data.entries.concat(mine);
  Store.save();
  closeModal(); Toast('已生成 60 天示例数据 🌱'); renderAll();
}
function clearSample() {
  Store.data.entries = Store.data.entries.filter(e => !e.sample);
  Store.data.seeded = false;
  Store.save(); closeModal(); Toast('示例数据已清除'); renderAll();
}
function clearAll() {
  Store.reset(); closeModal(); Toast('已清空，从现在重新开始 🌱'); renderAll();
}

function renderAll() {
  renderHome(); renderRecord(); renderInsight(); renderDiary(); renderCare();
}

/* 启动 */
Store.load();
if (!Store.data.entries.length && !Store.data.seeded) Store.seed();
renderNav();
renderRecord();
renderHome();
renderInsight();
renderDiary();
renderCare();
initChat();

$('#homeRange').addEventListener('click', e => {
  const b = e.target.closest('[data-r]'); if (!b) return;
  $$('#homeRange button').forEach(x => x.classList.remove('on'));
  b.classList.add('on'); homeRange = +b.dataset.r; renderHome();
});
$('#insightRange').addEventListener('click', e => {
  const b = e.target.closest('[data-r]'); if (!b) return;
  $$('#insightRange button').forEach(x => x.classList.remove('on'));
  b.classList.add('on'); insightRange = +b.dataset.r; renderInsight();
});

// 支持 #hash 直达
if (location.hash) {
  const p = location.hash.replace('#', '');
  if (NAV.some(n => n.k === p)) go(p);
}
