/* ==========================================================================
   data.js · 情绪字典 / 触发因素 / 本地存储 / 示例数据
   ========================================================================== */

/* ---------------- 情绪字典（valence：1 低落 → 10 愉悦） ---------------- */
const MOODS = [
  // 愉悦
  { k: 'happy',   e: '😄', n: '开心',   v: 8.6, c: '#FFB45C', g: 'up' },
  { k: 'calm',    e: '😌', n: '平静',   v: 7.8, c: '#5FD3B4', g: 'up' },
  { k: 'grateful',e: '🥰', n: '感恩',   v: 8.8, c: '#FF8FB1', g: 'up' },
  { k: 'excited', e: '🤩', n: '兴奋',   v: 8.9, c: '#FFA24C', g: 'up' },
  { k: 'proud',   e: '😎', n: '自豪',   v: 8.3, c: '#8FB4FF', g: 'up' },
  { k: 'loved',   e: '💗', n: '被爱',   v: 8.5, c: '#FF9FC0', g: 'up' },
  { k: 'relaxed', e: '🍃', n: '放松',   v: 7.6, c: '#7BD3C0', g: 'up' },
  // 复杂
  { k: 'relieved',e: '😅', n: '释然', v: 6.8, c: '#84D3B4', g: 'mid' },
  { k: 'nostalgic',e:'🌙', n: '怀念',   v: 6.0, c: '#A99BE8', g: 'mid' },
  { k: 'hopeful', e: '🌱', n: '期待',   v: 7.2, c: '#8FD98F', g: 'mid' },
  { k: 'okay',    e: '🙂', n: '还行',   v: 5.6, c: '#B7C0EA', g: 'mid' },
  { k: 'lost',    e: '😕', n: '迷茫',   v: 4.3, c: '#A8A0D8', g: 'mid' },
  { k: 'numb',    e: '😶', n: '麻木',   v: 4.6, c: '#A5A3C0', g: 'mid' },
  // 低落
  { k: 'down',    e: '😔', n: '失落',   v: 3.3, c: '#8E9BD6', g: 'down' },
  { k: 'sad',     e: '😢', n: '难过',   v: 2.6, c: '#7FA8E8', g: 'down' },
  { k: 'lonely',  e: '🌫️', n: '孤独',   v: 3.4, c: '#A99BE8', g: 'down' },
  { k: 'tired',   e: '🥱', n: '疲惫',   v: 3.6, c: '#9BA3C7', g: 'down' },
  { k: 'empty',   e: '🌑', n: '空虚',   v: 3.2, c: '#9E9BC6', g: 'down' },
  { k: 'guilty',  e: '😞', n: '内疚',   v: 3.0, c: '#8B9BD1', g: 'down' },
  { k: 'helpless',e: '😩', n: '无力',   v: 2.4, c: '#8AA0D8', g: 'down' },
  // 焦虑
  { k: 'anxious', e: '😖', n: '焦虑',   v: 2.8, c: '#C79BF0', g: 'anxious' },
  { k: 'nervous', e: '😬', n: '紧张',   v: 3.2, c: '#D6A0E8', g: 'anxious' },
  { k: 'worried', e: '😟', n: '担心',   v: 3.5, c: '#B69BE0', g: 'anxious' },
  { k: 'overwhelmed',e:'🌀', n: '喘不过气', v: 2.3, c: '#B389EF', g: 'anxious' },
  // 愤怒
  { k: 'angry',   e: '😠', n: '生气',   v: 2.5, c: '#FF8A7A', g: 'angry' },
  { k: 'irritable',e:'😤', n: '烦躁',   v: 3.1, c: '#FFA07E', g: 'angry' },
  { k: 'hurt',    e: '🥺', n: '委屈',   v: 3.3, c: '#FFA9C0', g: 'angry' },
  { k: 'unfair',  e: '😡', n: '愤愤不平', v: 2.7, c: '#FF7A6B', g: 'angry' }
];

const MOOD_MAP = {};
MOODS.forEach(m => MOOD_MAP[m.k] = m);
const moodOf = k => MOOD_MAP[k] || MOOD_MAP.calm;

/* ---------------- 触发因素 ---------------- */
const TRIGGERS = [
  { k: 'study',   n: '学业/考试',   kw: ['考试','论文','作业','成绩','复习','答辩','考研','课程','期末','绩点','导师','开题'] },
  { k: 'work',    n: '职场/工作',   kw: ['工作','加班','需求','项目','汇报','kpi','绩效','会议','组会','甲方','上线','排期','leader','老板','同事'] },
  { k: 'deadline',n: '截止日期',    kw: ['ddl','deadline','截止','来不及','赶','明天要交','期限','通宵'] },
  { k: 'relation',n: '人际关系',    kw: ['朋友','同学','室友','社交','人际','误会','吵架','被忽略','冷暴力','排挤','尴尬'] },
  { k: 'love',    n: '亲密关系',    kw: ['男朋友','女朋友','对象','恋人','分手','暧昧','异地','表白','前任','吵架'] },
  { k: 'family',  n: '家庭',        kw: ['父母','妈妈','爸爸','家里','家人','亲戚','催婚','代沟','原生家庭'] },
  { k: 'health',  n: '健康/身体',   kw: ['身体','生病','头疼','感冒','胃','生理期','体检','不舒服','疼痛','失眠'] },
  { k: 'sleep',   n: '睡眠不足',    kw: ['睡','熬夜','失眠','困','没睡好','通宵','起不来','梦'] },
  { k: 'money',   n: '金钱/开销',   kw: ['钱','工资','房租','花呗','信用卡','穷','开销','贷款','涨价'] },
  { k: 'future',  n: '未来/选择',   kw: ['未来','前途','选择','迷茫','方向','offer','秋招','求职','规划','人生','不知道以后'] },
  { k: 'self',    n: '自我期待',    kw: ['应该','必须','不够好','配不上','失败','没用','很差','废物','自责','要求自己','完美'] },
  { k: 'compare', n: '和别人比较',  kw: ['别人','人家','朋友圈','小红书','羡慕','差距','比不上','同辈','别人都'] },
  { k: 'info',    n: '信息过载',    kw: ['刷手机','新闻','热搜','推送','短视频','停不下来','信息','手机'] },
  { k: 'env',     n: '环境/天气',   kw: ['天气','下雨','闷热','冷','噪音','通勤','地铁','堵车','环境'] },
  { k: 'lonely',  n: '孤独感',      kw: ['一个人','孤独','没人','独处','空','没人懂','没人陪'] },
  { k: 'change',  n: '变化/失控',   kw: ['突然','变化','计划','取消','变动','不确定','意外','失控','临时'] }
];
const TRIGGER_MAP = {};
TRIGGERS.forEach(t => TRIGGER_MAP[t.k] = t);
const triggerName = k => (TRIGGER_MAP[k] ? TRIGGER_MAP[k].n : k);

/* ---------------- 存储 ---------------- */
const KEY = 'moodisle.v1';
const Store = {
  data: { entries: [], care: [], seeded: false },

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.data = Object.assign(this.data, JSON.parse(raw));
    } catch (e) { console.warn('读取本地数据失败', e); }
    return this.data;
  },
  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); }
    catch (e) { Toast('本地存储不可用，数据仅本次有效'); }
  },
  entries() {
    return this.data.entries.slice().sort((a, b) => new Date(b.t) - new Date(a.t));
  },
  add(entry) {
    entry.id = 'e' + Date.now() + Math.random().toString(36).slice(2, 6);
    this.data.entries.push(entry);
    this.save();
    return entry;
  },
  remove(id) {
    this.data.entries = this.data.entries.filter(x => x.id !== id);
    this.save();
  },
  logCare(kind) {
    this.data.care.push({ t: new Date().toISOString(), kind });
    this.save();
  },
  careCount() { return this.data.care.length; },
  reset() { this.data = { entries: [], care: [], seeded: false }; this.save(); },
  seed() {
    this.data.entries = genSample();
    this.data.seeded = true;
    this.save();
  }
};

/* ---------------- 示例数据生成（近 60 天，含真实感的情绪波动） ---------------- */
const SAMPLE_TEXT = {
  up: [
    '今天组会顺利过了，同事还夸我讲得清楚，久违地觉得自己的努力被看见了。',
    '去公园走了走，阳光很好，买了杯热豆浆，突然觉得生活也没那么糟。',
    '朋友从外地寄了明信片给我，拆开的那一下真的有被暖到。',
    '把拖了很久的事情做完了，松了一大口气，晚上吃了顿好的奖励自己。',
    '和妈妈视频聊了半小时，她说明天降温让我加衣服，被惦记的感觉真好。',
    '尝试了新的咖啡店，坐了一下午看完了半本书，难得的松弛。',
    '运动完出了汗，脑子清醒了很多，好像焦虑也跟着排出去了。',
    '下班时天空是粉色的，拍了一张照片，觉得今天赚到了。',
    '和很久没联系的朋友打了电话，聊得停不下来，笑到肚子疼。',
    '晚上做了顿饭，居然一次成功，给自己点个赞。'
  ],
  mid: [
    '说不上好也说不上坏，就是有点空，像在等什么但不知道在等什么。',
    '事情做完了，但没有想象中那么开心，可能只是累过头了。',
    '有点怀念以前的日子，也说不清具体怀念什么。',
    '今天按部就班，没什么特别，情绪像被调成了静音。',
    '开始怀疑现在走的路对不对，但也没有更好的答案。',
    '听了一下午雨声，什么都不想干，就让它下着吧。',
    '周末醒了但不想起，躺着刷手机，一天就这么过去了。',
    '翻了翻以前的照片，时间过得真快，有点感慨。'
  ],
  down: [
    '又是很丧的一天，什么都没做成，躺着刷手机到半夜，越刷越空。',
    '被否定的时候还是会很在意，嘴上说没事，心里其实很难受。',
    '一个人吃饭的时候突然觉得挺孤单的，周围都热热闹闹的。',
    '连续几天没睡好，整个人像被抽空了，做什么都提不起劲。',
    '明明已经很努力了，却还是觉得不够，这种感觉很消耗人。',
    '想起之前搞砸的事情，又陷进去了，反复回想当时的每个细节。',
    '不想和人说话，也不想解释，就想自己待着。',
    '朋友圈里大家都在往前走，好像只有我停在原地。',
    '傍晚的时候情绪突然掉下来了，说不清原因，就是很低。'
  ],
  anxious: [
    'ddl 就在眼前，进度还差一大截，一想到就心慌，根本静不下心。',
    '明天要汇报，今晚一直在脑子里过流程，越想越紧张，睡不着。',
    '好多事情堆在一起，不知道先做哪个，脑子像一团浆糊。',
    '一直在等一个消息，手机一响就紧张，等不到又很焦虑。',
    '担心自己做得不够好，担心被比较，担心让别人失望。',
    '事情多到半夜醒来还在想清单，越想越清醒。'
  ],
  angry: [
    '明明不是我的问题，最后却我来背锅，真的很生气。',
    '被人随口一句话刺到了，当着面没说什么，回来越想越委屈。',
    '排队被人插队，还理直气壮，气得我一路上都在碎碎念。',
    '说了好几遍的事情还是没被听见，那种被忽略的感觉很闷。',
    '分工的时候又是我的活最多，凭什么啊。'
  ]
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function genSample() {
  const list = [];
  const now = new Date();
  // 近 60 天，周末与工作日不同的触发分布
  for (let d = 59; d >= 0; d--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;
    // 记录概率：周末高一点
    const n = Math.random() < (isWeekend ? 0.85 : 0.72) ? (Math.random() < 0.3 ? 2 : 1) : 0;
    for (let i = 0; i < n; i++) {
      // 情绪基准：周一最低，周末最高；叠加正弦波动与噪声
      const phase = (59 - d) / 59;
      let base = 6.0 + 1.6 * Math.sin(phase * Math.PI * 2.1) + (isWeekend ? 0.8 : 0) - (dow === 1 ? 1.0 : 0);
      base += (Math.random() - 0.5) * 2.2;
      base = Math.max(1.4, Math.min(9.6, base));

      let group;
      if (base >= 6.2) group = Math.random() < 0.72 ? 'up' : 'mid';
      else if (base >= 4.9) group = 'mid';
      else if (base >= 4.0) group = Math.random() < 0.5 ? 'anxious' : 'down';
      else group = Math.random() < 0.6 ? 'down' : (Math.random() < 0.5 ? 'anxious' : 'angry');

      // 组内挑效价最接近目标值的情绪（带一点随机），避免分数系统性偏移
      const pool = MOODS.filter(m => m.g === group);
      const target = base + (Math.random() - 0.5) * 1.2;
      const mood = pool.slice().sort((a, b) => Math.abs(a.v - target) - Math.abs(b.v - target))[0];

      // 触发因素：与星期、情绪相关
      const cand = [];
      if (!isWeekend) cand.push('work', 'deadline', 'study', 'future', 'compare', 'env');
      else cand.push('lonely', 'relation', 'family', 'sleep', 'money', 'info');
      if (group === 'down') cand.push('self', 'lonely', 'sleep', 'health');
      if (group === 'anxious') cand.push('deadline', 'future', 'study', 'work');
      if (group === 'angry') cand.push('relation', 'work', 'unfair');
      if (group === 'up') cand.push('relation', 'family', 'relieved', 'change');
      const uniq = [...new Set(cand)].filter(c => TRIGGER_MAP[c]);
      const tCount = 1 + Math.floor(Math.random() * 2);
      const picks = [];
      for (let j = 0; j < tCount && picks.length < tCount; j++) {
        const t = pick(uniq);
        if (!picks.includes(t)) picks.push(t);
      }

      const hour = isWeekend
        ? 10 + Math.floor(Math.random() * 12)
        : (Math.random() < 0.5 ? 8 + Math.floor(Math.random() * 4) : 18 + Math.floor(Math.random() * 6));
      date.setHours(Math.min(23, hour), Math.floor(Math.random() * 59), 0, 0);

      list.push({
        id: 's' + d + '_' + i + '_' + Math.random().toString(36).slice(2, 6),
        t: date.toISOString(),
        mood: mood.k,
        intensity: Math.max(2, Math.min(10, Math.round(3.5 + Math.abs(base - 5) * 1.3 + (Math.random() - 0.5) * 2.5))),
        triggers: picks,
        text: pick(SAMPLE_TEXT[group]),
        sample: true
      });
    }
  }
  // 保证今日有 1 条，方便首屏展示
  const today = new Date();
  today.setHours(now.getHours(), now.getMinutes(), 0, 0);
  if (!list.some(x => new Date(x.t).toDateString() === today.toDateString())) {
    const m = pick(MOODS.filter(x => x.g === 'mid' || x.g === 'down'));
    list.push({
      id: 's_today', t: today.toISOString(), mood: m.k, intensity: 5,
      triggers: ['work'], text: pick(SAMPLE_TEXT.mid), sample: true
    });
  }
  return list;
}

/* ---------------- 统计工具 ---------------- */
const Stats = {
  /** 取最近 days 天的记录 */
  recent(days, entries) {
    const from = new Date(); from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - days + 1);
    return (entries || Store.entries()).filter(e => new Date(e.t) >= from);
  },
  /** 某条记录的有效情绪值：以 5 为中性，强度放大偏离程度 */
  score(e) {
    const m = moodOf(e.mood);
    const amp = 0.6 + 0.04 * (e.intensity || 5);
    return +(5 + (m.v - 5) * amp).toFixed(2);
  },
  daily(days, entries) {
    const arr = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const src = this.recent(days, entries);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const day = src.filter(e => new Date(e.t).toDateString() === key);
      const s = day.length ? day.reduce((a, e) => a + this.score(e), 0) / day.length : null;
      arr.push({ date: d, score: s, count: day.length, items: day });
    }
    return arr;
  },
  avg(days, entries) {
    const src = this.recent(days, entries);
    if (!src.length) return null;
    return +(src.reduce((a, e) => a + this.score(e), 0) / src.length).toFixed(2);
  },
  /** 波动：相邻记录差值的平均绝对值 */
  volatility(days, entries) {
    const d = this.daily(days, entries).filter(x => x.score !== null);
    if (d.length < 2) return 0;
    let s = 0;
    for (let i = 1; i < d.length; i++) s += Math.abs(d[i].score - d[i - 1].score);
    return +(s / (d.length - 1)).toFixed(2);
  },
  /** 连续记录天数 */
  streak(entries) {
    const set = new Set((entries || Store.entries()).map(e => new Date(e.t).toDateString()));
    let n = 0;
    const d = new Date(); d.setHours(0, 0, 0, 0);
    if (!set.has(d.toDateString())) d.setDate(d.getDate() - 1);
    while (set.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); }
    return n;
  },
  triggerRank(days, entries) {
    const src = this.recent(days, entries);
    const map = {};
    src.forEach(e => (e.triggers || []).forEach(t => {
      if (!map[t]) map[t] = { k: t, n: 0, sum: 0 };
      map[t].n++; map[t].sum += this.score(e);
    }));
    return Object.values(map).map(x => ({ ...x, avg: +(x.sum / x.n).toFixed(2) }))
      .sort((a, b) => b.n - a.n);
  },
  moodRank(days, entries) {
    const src = this.recent(days, entries);
    const map = {};
    src.forEach(e => { map[e.mood] = (map[e.mood] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  },
  /** 星期 × 时段热力：0=周日…6=周六；时段 早/上午/下午/晚上/深夜 */
  weekHeat(entries) {
    const grid = {};
    (entries || Store.entries()).forEach(e => {
      const d = new Date(e.t);
      const dow = d.getDay();
      const h = d.getHours();
      const slot = h < 6 ? 4 : h < 11 ? 0 : h < 14 ? 1 : h < 18 ? 2 : h < 23 ? 3 : 4;
      const key = dow + '_' + slot;
      if (!grid[key]) grid[key] = { sum: 0, n: 0 };
      grid[key].sum += this.score(e); grid[key].n++;
    });
    return grid;
  }
};

/* ---------------- 日期小工具 ---------------- */
const fmtDate = (d, withTime) => {
  const x = new Date(d);
  const s = `${x.getMonth() + 1}月${x.getDate()}日`;
  if (!withTime) return s;
  return s + ' ' + String(x.getHours()).padStart(2, '0') + ':' + String(x.getMinutes()).padStart(2, '0');
};
const dayLabel = d => ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(d).getDay()];
const relativeTime = d => {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 3600) return Math.max(1, Math.floor(diff / 60)) + ' 分钟前';
  if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前';
  if (diff < 86400 * 7) return Math.floor(diff / 86400) + ' 天前';
  return fmtDate(d);
};
