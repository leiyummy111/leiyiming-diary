/* ==========================================================================
   charts.js · 手写 SVG 图表（无第三方依赖）
   ========================================================================== */

const Charts = {
  /* ---------- 平滑折线（面积 + 渐变 + 悬浮提示） ---------- */
  line(el, points, opts) {
    opts = opts || {};
    const W = 720, H = opts.height || 220;
    const pad = { l: 34, r: 14, t: 16, b: 30 };
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const n = points.length;
    const xOf = i => pad.l + (n === 1 ? iw / 2 : (iw * i) / (n - 1));
    const yOf = v => pad.t + ih - ((v - 1) / 9) * ih;

    const valid = [];
    points.forEach((p, i) => { if (p.score !== null) valid.push({ x: xOf(i), y: yOf(p.score), score: p.score, p, i }); });
    if (!valid.length) {
      el.innerHTML = `<div class="empty"><div class="em">🌱</div><p>这段时间还没有记录，写下第一篇吧</p></div>`;
      return;
    }

    // 分段：连续的 valid 段分别画平滑曲线
    const segs = [];
    let cur = [];
    points.forEach((p, i) => {
      if (p.score === null) { if (cur.length) segs.push(cur); cur = []; }
      else cur.push({ x: xOf(i), y: yOf(p.score), p, i });
    });
    if (cur.length) segs.push(cur);

    const pathOf = seg => {
      if (seg.length === 1) return `M ${seg[0].x} ${seg[0].y}`;
      let d = `M ${seg[0].x} ${seg[0].y}`;
      for (let i = 0; i < seg.length - 1; i++) {
        const p0 = seg[i - 1] || seg[i], p1 = seg[i], p2 = seg[i + 1], p3 = seg[i + 2] || p2;
        const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
      return d;
    };

    // 网格线
    let grid = '';
    [2, 4, 6, 8, 10].forEach(v => {
      const y = yOf(v);
      grid += `<line x1="${pad.l}" y1="${y.toFixed(1)}" x2="${W - pad.r}" y2="${y.toFixed(1)}"
        stroke="rgba(109,97,72,.16)" stroke-width="1" stroke-dasharray="3 5"/>
        <text x="${pad.l - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end"
        font-size="10" fill="#B0A78F">${v}</text>`;
    });

    // x 轴标签
    let xlab = '';
    const step = Math.max(1, Math.ceil(n / (n > 20 ? 8 : 7)));
    points.forEach((p, i) => {
      if (i % step === 0 || i === n - 1) {
        xlab += `<text x="${xOf(i).toFixed(1)}" y="${H - 8}" text-anchor="middle"
          font-size="10" fill="#B0A78F">${p.date.getMonth() + 1}/${p.date.getDate()}</text>`;
      }
    });

    const first = valid[0], last = valid[valid.length - 1];
    const gradId = 'lg' + Math.random().toString(36).slice(2, 7);

    el.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${H}px">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3F5E96" stop-opacity=".22"/>
            <stop offset="55%" stop-color="#9FB0CE" stop-opacity=".08"/>
            <stop offset="100%" stop-color="#FFB0C8" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="${gradId}s" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#3F5E96"/>
            <stop offset="100%" stop-color="#C9584F"/>
          </linearGradient>
        </defs>
        ${grid}${xlab}
        ${segs.map(s => `<path class="ln" d="${pathOf(s)}" fill="none" stroke="url(#${gradId}s)"
            stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
        ${segs.map(s => `<path d="${pathOf(s)} L ${s[s.length - 1].x} ${pad.t + ih} L ${s[0].x} ${pad.t + ih} Z"
            fill="url(#${gradId})" class="ar"/>`).join('')}
        ${valid.map(p => `<circle cx="${xOf(p.i)}" cy="${p.y}" r="3.5" fill="#fff"
            stroke="#7C6BFF" stroke-width="2.2" opacity="0" class="pt"/>`).join('')}
        <line class="cursor" x1="0" y1="${pad.t}" x2="0" y2="${pad.t + ih}"
          stroke="#7C6BFF" stroke-width="1" stroke-dasharray="4 4" opacity="0"/>
        <circle class="hl" r="6" fill="#7C6BFF" opacity="0"/>
        <g class="tipg" opacity="0">
          <rect rx="8" fill="rgba(61,55,45,.94)" height="34" width="96" x="0" y="0"/>
          <text class="t1" font-size="11" fill="#fff" x="0" y="0"></text>
          <text class="t2" font-size="11" fill="#C9C4F0" x="0" y="0"></text>
        </g>
      </svg>
      <div class="lnTip" style="font-size:11.5px;color:var(--ink-400);margin-top:8px;text-align:center">
        ${first.p.date.getMonth() + 1}/${first.p.date.getDate()} → ${last.p.date.getMonth() + 1}/${last.p.date.getDate()}
        &nbsp;·&nbsp; 共 ${valid.length} 天有记录
      </div>`;

    // 入场动画
    const svg = el.querySelector('svg');
    const paths = svg.querySelectorAll('.ln');
    paths.forEach(p => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      p.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.22,.68,0,1)';
      requestAnimationFrame(() => { p.style.strokeDashoffset = 0; });
    });
    svg.querySelectorAll('.ar').forEach(a => { a.style.transition = 'opacity .9s .3s'; a.style.opacity = 0; requestAnimationFrame(() => a.style.opacity = 1); });
    svg.querySelectorAll('.pt').forEach((c, i) => {
      c.style.transition = `opacity .3s ${0.5 + i * 0.02}s`;
      requestAnimationFrame(() => c.style.opacity = 1);
    });

    // 悬浮交互
    const cursor = svg.querySelector('.cursor'), hl = svg.querySelector('.hl');
    const tipg = svg.querySelector('.tipg'), t1 = svg.querySelector('.t1'), t2 = svg.querySelector('.t2');
    const tip = el.querySelector('.lnTip');
    const baseTip = tip.textContent;
    const toSvgX = clientX => {
      const r = svg.getBoundingClientRect();
      return (clientX - r.left) / r.width * W;
    };

    svg.addEventListener('mousemove', ev => {
      const mx = toSvgX(ev.clientX);
      let best = null, bd = 1e9;
      valid.forEach(p => {
        const px = xOf(p.i), d = Math.abs(px - mx);
        if (d < bd) { bd = d; best = p; }
      });
      if (!best) return;
      const bx = xOf(best.i), by = best.y;
      cursor.setAttribute('x1', bx); cursor.setAttribute('x2', bx); cursor.setAttribute('opacity', .5);
      hl.setAttribute('cx', bx); hl.setAttribute('cy', by); hl.setAttribute('opacity', 1);
      const items = best.p.items || [];
      const moods = items.map(i => moodOf(i.mood).e).join('');
      t1.textContent = `${best.p.date.getMonth() + 1}/${best.p.date.getDate()} ${dayLabel(best.p.date)} ${moods}`;
      t2.textContent = `情绪值 ${best.score.toFixed(1)} · ${best.p.count} 条`;
      const tw = 116;
      const tx = Math.max(pad.l, Math.min(W - pad.r - tw, bx - tw / 2));
      tipg.setAttribute('opacity', 1);
      tipg.querySelector('rect').setAttribute('x', tx); tipg.querySelector('rect').setAttribute('y', Math.max(pad.t - 4, by - 42));
      tipg.querySelector('rect').setAttribute('width', tw);
      t1.setAttribute('x', tx + 10); t1.setAttribute('y', Math.max(pad.t + 10, by - 22));
      t2.setAttribute('x', tx + 10); t2.setAttribute('y', Math.max(pad.t + 24, by - 8));
      tip.textContent = `${fmtDate(best.p.date)} ${dayLabel(best.p.date)} · ${moods} ${items.map(i => moodOf(i.mood).n).join('、')} · 情绪值 ${best.score.toFixed(1)}`;
    });
    svg.addEventListener('mouseleave', () => {
      cursor.setAttribute('opacity', 0); hl.setAttribute('opacity', 0); tipg.setAttribute('opacity', 0);
      tip.textContent = baseTip;
    });
  },

  /* ---------- 甜甜圈图 ---------- */
  donut(el, data) {
    // data: [[name, value, color], ...]
    const total = data.reduce((a, d) => a + d[1], 0);
    if (!total) { el.innerHTML = `<div class="empty"><div class="em">🍩</div><p>暂无数据</p></div>`; return; }
    const S = 210, R = 76, C = 2 * Math.PI * R;
    let off = 0;
    const arcs = data.map(d => {
      const frac = d[1] / total;
      const seg = `<circle cx="${S / 2}" cy="${S / 2}" r="${R}" fill="none"
        stroke="${d[2]}" stroke-width="26" stroke-linecap="round"
        stroke-dasharray="${(frac * C).toFixed(2)} ${C}"
        stroke-dashoffset="${(-off * C).toFixed(2)}"
        transform="rotate(-90 ${S / 2} ${S / 2})" class="dseg"/>`;
      off += frac;
      return seg;
    }).join('');

    el.innerHTML = `
      <svg viewBox="0 0 ${S} ${S}" style="max-width:230px;margin:0 auto">
        <circle cx="${S / 2}" cy="${S / 2}" r="${R}" fill="none" stroke="rgba(109,97,72,.12)" stroke-width="26"/>
        ${arcs}
        <text x="${S / 2}" y="${S / 2 - 2}" text-anchor="middle" font-size="26" font-weight="700" fill="#1D1A31">${total}</text>
        <text x="${S / 2}" y="${S / 2 + 18}" text-anchor="middle" font-size="11" fill="#B0A78F">次记录</text>
      </svg>`;
    el.querySelectorAll('.dseg').forEach((c, i) => {
      const len = c.getTotalLength ? c.getTotalLength() : C;
      c.style.strokeDasharray = `0 ${C}`;
      c.style.transition = `stroke-dasharray .8s ${i * 0.08}s cubic-bezier(.22,.68,0,1)`;
      requestAnimationFrame(() => { c.style.strokeDasharray = c.getAttribute('stroke-dasharray'); });
    });
  },

  /* ---------- 星期 × 时段热力图 ---------- */
  weekHeat(el, grid) {
    const rows = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const cols = ['🌅 早晨', '🌤 上午', '🌇 下午', '🌆 晚上', '🌙 深夜'];
    const slots = [0, 1, 2, 3, 4];
    let html = `<div style="overflow-x:auto"><table style="border-collapse:separate;border-spacing:5px;width:100%;min-width:420px">`;
    html += `<tr><td></td>${cols.map(c => `<td style="font-size:10.5px;color:var(--ink-400);text-align:center;padding-bottom:2px">${c}</td>`).join('')}</tr>`;
    const cellColor = v => {
      if (v === null) return 'rgba(122,112,88,.07)';
      const t = Math.max(0, Math.min(1, (v - 1) / 9));
      // 低 → 冷紫，高 → 暖橙
      const stops = [[138,158,196],[163,178,208],[206,199,178],[242,205,142],[233,166,88]];
      const i = Math.min(stops.length - 1, Math.floor(t * stops.length));
      const c = stops[i];
      return `rgb(${c[0]},${c[1]},${c[2]})`;
    };
    for (let d = 0; d < 7; d++) {
      html += `<tr><td style="font-size:11px;color:var(--ink-400);white-space:nowrap;padding-right:4px">${rows[d]}</td>`;
      slots.forEach(s => {
        const g = grid[d + '_' + s];
        const v = g ? +(g.sum / g.n).toFixed(1) : null;
        html += `<td>
          <div title="${g ? `平均 ${v} · ${g.n} 条` : '无记录'}"
            style="height:34px;border-radius:9px;background:${cellColor(v)};display:grid;place-items:center;
            font-size:11px;color:${v && v > 6.4 ? '#8A5A1E' : '#fff'};font-weight:600;cursor:default;
            transition:transform .2s">${v === null ? '' : v.toFixed(1)}</div>
        </td>`;
      });
      html += `</tr>`;
    }
    html += `</table></div>`;
    el.innerHTML = html;
  },

  /* ---------- 日历热力图（近 12 周） ---------- */
  calendar(el, entries) {
    const map = {};
    entries.forEach(e => {
      const k = new Date(e.t).toDateString();
      if (!map[k]) map[k] = { sum: 0, n: 0 };
      map[k].sum += Stats.score(e); map[k].n++;
    });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - (start.getDay() + 7 * 11)); // 12 周前所在周日
    let cells = '';
    for (let i = 0; i < 84; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      if (d > today) { cells += `<div class="heat-cell" style="background:transparent"></div>`; continue; }
      const g = map[d.toDateString()];
      const v = g ? g.sum / g.n : null;
      const t = v === null ? -1 : Math.max(0, Math.min(1, (v - 1) / 9));
      const bg = v === null ? 'rgba(122,112,88,.07)'
        : t < 0.25 ? '#D9CBA8' : t < 0.4 ? '#B0BFD9' : t < 0.55 ? '#8FA3C9' : t < 0.7 ? '#F2CD8E' : '#E9A658';
      cells += `<div class="heat-cell" style="background:${bg}"
        title="${fmtDate(d)}${v !== null ? ' · 情绪值 ' + v.toFixed(1) : ' · 未记录'}"></div>`;
    }
    el.innerHTML = cells;
  }
};
