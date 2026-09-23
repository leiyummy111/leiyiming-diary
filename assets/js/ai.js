/* ==========================================================================
   ai.js · 情绪理解引擎 / 洞察生成 / 关怀方案推荐 / 陪伴对话
   完全在浏览器本地运行，无需联网、不上传任何内容
   ========================================================================== */

const AI = {
  /* ---------- 1. 文本 → 情绪触发因素识别 ---------- */
  scanTriggers(text) {
    const t = (text || '').toLowerCase();
    const hits = [];
    TRIGGERS.forEach(tr => {
      let c = 0;
      tr.kw.forEach(w => { if (t.includes(w.toLowerCase())) c++; });
      if (c) hits.push({ k: tr.k, n: triggerName(tr.k), score: c });
    });
    return hits.sort((a, b) => b.score - a.score).slice(0, 4);
  },

  /* ---------- 2. 认知偏差 / 思维习惯识别 ---------- */
  DISTORTIONS: [
    { kw: ['总是', '永远', '从来', '每次都', '所有人都'], name: '过度概括', tip: '「总是 / 永远」会把一次挫败放大成永久判断。试试把它改成「这次」——范围一小，压力也会变小。' },
    { kw: ['应该', '必须', '本来就该', '不得不'], name: '应该式思维', tip: '「我应该做到」背后往往藏着很高的自我要求。把它换成「我希望我可以」，给自己留一点余地。' },
    { kw: ['完了', '毁了', '没救了', '彻底', '全完了'], name: '灾难化', tip: '事情很可能没有脑补的那么严重。问自己一句：最坏的结果到底是什么？我能承受多少？' },
    { kw: ['都是我的错', '怪我', '我害的', '我不配'], name: '过度自责', tip: '你在承担可能不属于你的责任。试着区分「我能控制的部分」和「不受我控制的部分」。' },
    { kw: ['废物', '没用', '很差劲', '垃圾', '一事无成'], name: '贴标签', tip: '一个标签盖不住一个人的全部。把「我是废物」改写成「我现在很累，这件事没做好」。' },
    { kw: ['别人都', '人家', '比不上', '差距', '羡慕'], name: '社会比较', tip: '你看到的是别人的高光片段，却拿自己的全部日常去比。把参照系换回昨天的自己。' },
    { kw: ['肯定', '一定会', '肯定是', '注定'], name: '妄下结论', tip: '你在用猜测代替事实。把「肯定会」写成「我担心会」，然后看看证据是什么。' }
  ],
  scanDistortion(text) {
    const t = text || '';
    for (const d of this.DISTORTIONS) {
      for (const w of d.kw) if (t.includes(w)) return d;
    }
    return null;
  },

  /* ---------- 3. 单条记录的即时分析 ---------- */
  analyze(entry) {
    const m = moodOf(entry.mood);
    const auto = this.scanTriggers(entry.text);
    const picked = (entry.triggers || []).map(triggerName);
    const dist = this.scanDistortion(entry.text);
    const intensity = entry.intensity || 5;
    const level = intensity >= 8 ? '很强' : intensity >= 6 ? '比较强' : intensity >= 4 ? '中等' : '轻微';
    return { mood: m, auto, picked, dist, level, intensity };
  },

  /* ---------- 4. 关怀方案库 ---------- */
  PLANS: {
    down: [
      { id: 'walk', em: '🚶‍♀️', kind: 'sport', title: '阳光散步 15 分钟', dur: '15 分钟', desc: '不为了锻炼，只为让身体动起来。阳光和走动会悄悄提升血清素。', steps: ['出门，不设目的地', '把注意力放在脚掌触地的感觉上', '路过时留意 3 样好看的东西', '回来后写一句：今天我走过了哪里'] },
      { id: 'gratitude', em: '🫧', kind: 'writing', title: '感恩三件小事', dur: '5 分钟', desc: '低落时大脑会自动过滤掉好的部分，这个练习帮它重新对焦。', steps: ['写下今天发生的 3 件还算不错的小事', '每件事补一句「它为什么让我舒服」', '哪怕只是「今天的咖啡刚好」也算'] },
      { id: 'breath', em: '🫁', kind: 'breath', title: '4-7-8 放松呼吸', dur: '3 分钟', desc: '延长呼气能激活副交感神经，让身体从紧绷里松开。', steps: ['吸气 4 秒', '屏息 7 秒', '缓慢呼气 8 秒', '重复 4 轮'] },
      { id: 'connect', em: '☎️', kind: 'social', title: '给一个人发条消息', dur: '5 分钟', desc: '低落时我们会本能地缩起来，而连接感是最好的反方向拉力。', steps: ['想一个你信任的人', '发一句「最近怎么样」，或分享一张今天的照片', '不用解释自己的情绪'] }
    ],
    anxious: [
      { id: 'ground', em: '🧭', kind: 'grounding', title: '5-4-3-2-1 感官着陆', dur: '5 分钟', desc: '焦虑是把注意力丢给了未来，这个练习把它拉回此刻的身体。', steps: ['说出你看到的 5 样东西', '触摸到的 4 样东西', '听到的 3 种声音', '闻到的 2 种气味', '尝到的 1 种味道'] },
      { id: 'breath', em: '🫁', kind: 'breath', title: '箱式呼吸 4-4-4-4', dur: '4 分钟', desc: '规律节奏会给大脑一个「现在是安全的」信号。', steps: ['吸气 4 秒', '屏息 4 秒', '呼气 4 秒', '屏息 4 秒，重复 6 轮'] },
      { id: 'dump', em: '📝', kind: 'writing', title: '焦虑倾倒 + 分类', dur: '8 分钟', desc: '把脑子里转的东西倒出来，再分成「能做的」和「管不了的」。', steps: ['限时 5 分钟，把所有担心写下来，不修饰', '逐条标注：能行动 / 管不了', '从「能行动」里挑最小的 1 件，做 10 分钟', '「管不了」的部分，写一句「我先放下它」'] },
      { id: 'move', em: '🏃‍♀️', kind: 'sport', title: '高强度间歇 10 分钟', dur: '10 分钟', desc: '焦虑带来的肾上腺素，可以用身体代谢掉。', steps: ['开合跳 30 秒 × 4 组', '组间慢走 30 秒', '结束后做 1 分钟拉伸'] }
    ],
    angry: [
      { id: 'vent', em: '🔥', kind: 'writing', title: '不修饰地写 5 分钟', dur: '5 分钟', desc: '先允许自己生气，再决定怎么处理。写完可以撕掉。', steps: ['不停笔写 5 分钟，脏话也可以', '写完后问自己：我真正在意的是什么？', '如果需要回应，先等 30 分钟再发出去'] },
      { id: 'move', em: '🥊', kind: 'sport', title: '高强度释放 15 分钟', dur: '15 分钟', desc: '愤怒是行动能量，用身体消耗它比压住它更健康。', steps: ['快跑 / 跳绳 / 搏击操任选', '强度到微微喘但能坚持', '结束后冷水洗脸 30 秒'] },
      { id: 'breath', em: '🌊', kind: 'breath', title: '延长呼气 4-8', dur: '3 分钟', desc: '慢慢呼气会让心跳跟着慢下来。', steps: ['吸气 4 秒', '呼气 8 秒', '重复 8 轮，肩膀放松'] },
      { id: 'reframe', em: '🔄', kind: 'writing', title: '换位写一句', dur: '5 分钟', desc: '不是为了原谅对方，是为了让自己不再被情绪绑住。', steps: ['写下对方的处境可能是怎样的', '写下「我的需要是什么」', '把「他不应该」改成「我希望他」'] }
    ],
    mid: [
      { id: 'checkin', em: '🧘', kind: 'writing', title: '身体扫描 5 分钟', dur: '5 分钟', desc: '说不清情绪时，先从身体开始问。', steps: ['从脚趾开始，依次注意每个部位', '哪里有紧、酸、沉？只观察不评判', '把发现写成一句话'] },
      { id: 'breath', em: '🌬️', kind: 'breath', title: '舒缓呼吸 5-5', dur: '3 分钟', desc: '等长呼吸让节奏稳定下来。', steps: ['吸气 5 秒', '呼气 5 秒', '重复 10 轮'] },
      { id: 'walk', em: '🌳', kind: 'sport', title: '无目的散步 20 分钟', dur: '20 分钟', desc: '不给散步任何目标，让它成为一段空白。', steps: ['不带耳机或只放轻音乐', '走 20 分钟', '回来后记一句身体感受'] },
      { id: 'music', em: '🎧', kind: 'music', title: '环境音 + 发呆 10 分钟', dur: '10 分钟', desc: '给大脑一段不需要处理信息的空白。', steps: ['播放雨声或海浪', '闭眼，什么都不做', '10 分钟后记录状态变化'] }
    ],
    up: [
      { id: 'savor', em: '✨', kind: 'writing', title: '放大美好 3 分钟', dur: '3 分钟', desc: '好情绪停留得越久，记忆里留下的就越多。', steps: ['回想刚才那件好事的细节', '写下它为什么发生、你做了什么', '告诉一个人'] },
      { id: 'flow', em: '🎨', kind: 'social', title: '做一件心流小事', dur: '20 分钟', desc: '好状态适合开始一件一直想做的事。', steps: ['挑一件略有挑战但不焦虑的事', '设 20 分钟计时', '结束后记一句感受'] },
      { id: 'breath', em: '🌬️', kind: 'breath', title: '感恩呼吸 10 轮', dur: '3 分钟', desc: '把好的状态轻轻收进身体里。', steps: ['吸气时想一个感谢的人', '呼气时把这份安稳送给自己', '重复 10 轮'] },
      { id: 'move', em: '🏸', kind: 'sport', title: '快乐运动 20 分钟', dur: '20 分钟', desc: '状态好时运动，效果会被放大。', steps: ['选一项你喜欢的运动', '强度中等', '结束后记录心情分数'] }
    ]
  },

  /* ---------- 5. 音乐处方 ---------- */
  MUSIC: {
    down:    [{ t: '低能量时不要听更丧的歌', d: '节奏 90–110 BPM · 大调 · 有歌词但不悲伤', q: '像《Somebody That I Used To Know》的轻快版那种质感', plat: '温柔流行 / City Pop' },
              { t: '先共鸣，再抬起', d: '允许听 2 首慢歌，再切到轻快曲目', q: '慢歌 → 中速 → 轻快的三段式歌单', plat: '钢琴 ambient → 独立流行' }],
    anxious: [{ t: '降速：跟心跳一起慢下来', d: '60 BPM 以下 · 无歌词 · 稳定节拍', q: '双耳节拍 / 低频 drone / 钢琴留白', plat: 'ambient / 低频脑波' },
              { t: '自然白噪做底', d: '雨声、壁炉、远处的海', q: '连续无突变的自然声', plat: '自然音景' }],
    angry:   [{ t: '先释放，再降温', d: '前 10 分钟节奏感强的摇滚 / 说唱，之后切 ambient', q: '强节拍 → 缓慢器乐', plat: '摇滚 → 后摇' },
              { t: '避免反刍型歌词', d: '先别听会让你反复回想的歌', q: '纯器乐更安全', plat: '器乐 / 电子' }],
    mid:     [{ t: '给空白一点温度', d: 'Lo-fi · 轻柔人声 · 不抢注意力', q: '咖啡馆爵士 / lo-fi hip hop', plat: 'Lo-fi / Bossa Nova' },
              { t: '轻轻推一下情绪', d: '中速器乐 · 温暖的铜管或弦乐', q: '后摇 / 电影配乐式渐强', plat: '后摇 / Neo-classical' }],
    up:      [{ t: '把好状态放大', d: '节奏明快 · 你熟悉的歌', q: '会跟着哼起来的那种', plat: '流行 / Funk' }]
  },

  /* ---------- 6. 运动处方 ---------- */
  SPORT: {
    down:    [{ t: '阳光快走 20 分钟', d: '最容易被启动的低门槛运动，光照 + 节奏步频双重起效', k: '低强度 · 户外' },
              { t: '瑜伽 / 舒展拉伸 15 分钟', d: '低落时身体是蜷缩的，舒展的动作会给大脑反向信号', k: '低强度 · 室内' }],
    anxious: [{ t: '跳绳 / 开合跳 10 分钟', d: '快速消耗掉肾上腺素，做完通常会明显松下来', k: '中高强度' },
              { t: '慢跑 + 专注呼吸 20 分钟', d: '把呼吸和步伐绑定（两步吸、两步呼）', k: '中强度 · 有氧' }],
    angry:   [{ t: '搏击操 / 拳击 15 分钟', d: '给愤怒一个安全的出口，注意别练到受伤', k: '高强度 · 释放' },
              { t: '冲刺跑 6 × 30 秒', d: '短时间高强度，结束后做 3 分钟慢走降速', k: '高强度 · 间歇' }],
    mid:     [{ t: '散步 20 分钟 / 骑车 15 分钟', d: '不追求心率，让身体先动起来', k: '低强度' },
              { t: '游泳 20 分钟', d: '水的包裹感本身就有安抚作用', k: '中强度' }],
    up:      [{ t: '任意喜欢的运动 30 分钟', d: '好状态适合尝试新项目：攀岩、舞蹈、球类', k: '自由选择' }]
  },

  /* ---------- 7. 综合推荐 ---------- */
  recommend(moodKey, intensity, triggers) {
    const m = moodOf(moodKey);
    let group = m.g;
    if (group === 'down' && triggers && triggers.includes('health')) group = 'down';
    const plans = (this.PLANS[group] || this.PLANS.mid).slice();
    // 疲惫 / 睡眠不足 → 优先休息类
    if (triggers && (triggers.includes('sleep') || triggers.includes('health'))) {
      const rest = { id: 'rest', em: '🛌', kind: 'rest', title: '先把睡眠补回来', dur: '今晚', desc: '很多情绪问题，本质上是睡眠问题。今晚提前 30 分钟放下手机。', steps: ['睡前 30 分钟离开屏幕', '把房间调暗，做 5 分钟伸展', '明早固定时间起床，不补觉过头'] };
      plans.unshift(rest);
    }
    return plans.slice(0, 4);
  },

  /* ---------- 8. 洞察生成 ---------- */
  insights(entries, days) {
    const out = [];
    if (!entries.length) {
      out.push({ ic: '🌱', tx: '还没有足够的记录。写下第一篇后，这里会开始长出属于你的情绪规律。' });
      return out;
    }
    const all = entries;

    // (1) 整体水平
    const avg = Stats.avg(days, entries);
    if (avg !== null) {
      const prevFrom = new Date(); prevFrom.setHours(0, 0, 0, 0); prevFrom.setDate(prevFrom.getDate() - days * 2 + 1);
      const prevTo = new Date(); prevTo.setHours(0, 0, 0, 0); prevTo.setDate(prevTo.getDate() - days);
      const prev = all.filter(e => { const d = new Date(e.t); return d >= prevFrom && d < prevTo; });
      const pAvg = prev.length ? prev.reduce((a, e) => a + Stats.score(e), 0) / prev.length : null;
      const label = avg >= 7 ? '整体偏愉悦' : avg >= 5.5 ? '整体平稳' : avg >= 4 ? '整体偏低落' : '整体明显低落';
      let delta = '';
      if (pAvg !== null) {
        const diff = avg - pAvg;
        // 中国习惯：正向变化用红色，负向用绿色
        const cls = diff >= 0 ? 'up' : 'down';
        delta = `<b class="${cls}">${diff >= 0 ? '↑' : '↓'} ${Math.abs(diff).toFixed(1)}</b> 相比上一个${days}天`;
      }
      out.push({ ic: '📊', tx: `最近 ${days} 天平均情绪值 <b>${avg.toFixed(1)}</b>，${label}。${delta}` });
    }

    // (2) 星期规律
    const byDow = {};
    all.forEach(e => {
      const d = new Date(e.t).getDay();
      if (!byDow[d]) byDow[d] = { s: 0, n: 0 };
      byDow[d].s += Stats.score(e); byDow[d].n++;
    });
    const dowArr = Object.entries(byDow).filter(x => x[1].n >= 2)
      .map(([d, v]) => ({ d: +d, avg: v.s / v.n, n: v.n })).sort((a, b) => a.avg - b.avg);
    if (dowArr.length >= 3) {
      const worst = dowArr[0], best = dowArr[dowArr.length - 1];
      if (best.avg - worst.avg > 0.8) {
        const W7 = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        out.push({ ic: '📅', tx: `<b>${W7[worst.d]}</b> 是你最容易低落的一天（均值 ${worst.avg.toFixed(1)}），而 <b>${W7[best.d]}</b> 状态最好（${best.avg.toFixed(1)}）。可以把重要的事安排在高能量的那天，把 ${W7[worst.d]} 留给自己。` });
      }
    }

    // (3) 时段规律
    const slotName = ['早晨', '上午', '下午', '晚上', '深夜'];
    const bySlot = {};
    all.forEach(e => {
      const h = new Date(e.t).getHours();
      const s = h < 6 ? 4 : h < 11 ? 0 : h < 14 ? 1 : h < 18 ? 2 : h < 23 ? 3 : 4;
      if (!bySlot[s]) bySlot[s] = { s: 0, n: 0 };
      bySlot[s].s += Stats.score(e); bySlot[s].n++;
    });
    const slotArr = Object.entries(bySlot).filter(x => x[1].n >= 2).map(([s, v]) => ({ s: +s, avg: v.s / v.n })).sort((a, b) => a.avg - b.avg);
    if (slotArr.length >= 2 && slotArr[slotArr.length - 1].avg - slotArr[0].avg > 0.7) {
      const w = slotArr[0], b = slotArr[slotArr.length - 1];
      out.push({ ic: '🕐', tx: `<b>${slotName[w.s]}</b> 的情绪最低（${w.avg.toFixed(1)}），<b>${slotName[b.s]}</b> 最高（${b.avg.toFixed(1)}）。低谷时段安排些轻松的事，别跟自己硬碰。` });
    }

    // (4) 触发因素
    const tr = Stats.triggerRank(days, entries);
    if (tr.length) {
      const top = tr[0], worstT = tr.slice().sort((a, b) => a.avg - b.avg)[0];
      out.push({ ic: '🎯', tx: `出现最多的触发因素是 <b>${triggerName(top.k)}</b>（${top.n} 次）；而影响最大的（记录时情绪最低）是 <b>${triggerName(worstT.k)}</b>，相关记录均值只有 ${worstT.avg.toFixed(1)}。` });
      if (top.n >= 3 && top.avg < 5) {
        out.push({ ic: '🧭', tx: `当 <b>${triggerName(top.k)}</b> 出现时，你的情绪均值会掉到 ${top.avg.toFixed(1)}。可以提前给自己准备一套固定应对动作，而不是等情绪来了再想办法。` });
      }
    }

    // (5) 情绪构成
    const mr = Stats.moodRank(days, entries);
    if (mr.length) {
      const top3 = mr.slice(0, 3).map(([k, n]) => `${moodOf(k).n}(${n}次)`).join('、');
      out.push({ ic: '🎭', tx: `最近最常出现的三种感受：${top3}。它们基本勾勒出了这段时间的情绪底色。` });
    }

    // (6) 记录本身的价值
    const withText = all.filter(e => e.text && e.text.length > 20);
    const without = all.filter(e => !e.text || e.text.length <= 20);
    if (withText.length > 3 && without.length > 3) {
      const a = withText.reduce((s, e) => s + Stats.score(e), 0) / withText.length;
      const b = without.reduce((s, e) => s + Stats.score(e), 0) / without.length;
      if (Math.abs(a - b) > 0.4) {
        out.push({ ic: '✍️', tx: `写下具体内容的记录，情绪均值 <b>${a.toFixed(1)}</b>${a > b ? '，明显高于' : '，低于'}只打卡的记录（${b.toFixed(1)}）。${a > b ? '书写本身就在帮你消化情绪，值得继续。' : '也许你在最难的时候才愿意多写，这也很正常。'}` });
      }
    }

    // (7) 波动
    const vol = Stats.volatility(days, entries);
    if (vol > 2.2) out.push({ ic: '🎢', tx: `情绪波动较大（平均每天变化 ${vol.toFixed(1)}）。高波动不一定是坏事，但给它一个稳定的锚点会好很多：固定作息、固定运动、固定的记录时间。` });
    else if (vol > 0 && vol < 1) out.push({ ic: '🌊', tx: `情绪波动很小（平均每天变化 ${vol.toFixed(1)}），状态相当稳定，保持现在的节奏就好。` });

    // (8) 风险提示
    const low7 = Stats.recent(7, entries).filter(e => Stats.score(e) < 3.5);
    if (low7.length >= 4) {
      out.push({ ic: '🫂', tx: `最近 7 天有 <b>${low7.length}</b> 条记录处于明显低落状态。如果这种感觉持续两周以上、已经影响到睡眠或日常，建议考虑联系专业心理咨询师——这不代表你不够好，只是这件事值得被更认真地对待。` });
    }

    return out.slice(0, 6);
  },

  /* ---------- 9. 陪伴对话（本地规则引擎） ---------- */
  CRISIS: ['不想活', '自杀', '结束一切', '活着没意义', '消失算了', '不想存在', '轻生'],
  chat(msg, ctx) {
    const t = (msg || '').trim();
    if (!t) return '我在这里，你想说什么都可以。';

    // 危机优先
    for (const w of this.CRISIS) {
      if (t.includes(w)) {
        return '听到你这么说，我很担心你。你现在的痛苦是真实的，也值得被认真对待——请一定要告诉身边信任的人，或者现在就联系专业支持：全国 24 小时心理援助热线 <b>12356</b>，北京心理危机研究与干预中心 <b>010-82951332</b>。你不需要一个人扛这件事，我会一直在这里陪着你。';
      }
    }

    const lower = t.toLowerCase();
    const scan = this.scanTriggers(t);
    const dist = this.scanDistortion(t);
    const negWords = ['难过','难受','低落','崩溃','哭','累','疲惫','委屈','生气','愤怒','烦','焦虑','紧张','担心','害怕','孤独','寂寞','空虚','无力','绝望','压力','失眠','没劲'];
    const posWords = ['开心','高兴','快乐','不错','顺利','成功','喜欢','感谢','谢谢','棒','开心','轻松','放松','惊喜','表白','通过','过了','拿到'];
    const neg = negWords.filter(w => t.includes(w)).length;
    const pos = posWords.filter(w => t.includes(w)).length;

    // 打招呼
    if (/^(hi|hello|哈喽|你好|在吗|嗨)\s*[！!。.？?~]*$/i.test(t) || t.length <= 3 && /你好|在吗|嗨|hi/i.test(t)) {
      return '我在。今天过得怎么样？不用组织语言，想到什么就说什么，哪怕只是一个词也可以。';
    }
    // 道谢
    if (/谢谢|感谢|多谢/.test(t) && t.length < 12) {
      return '不用谢。随时都可以来找我，不需要有理由，也不需要等到很难受的时候。';
    }
    // 求助建议
    if (/怎么办|如何|怎么|能给我|建议|帮我想想|求解/.test(t) && t.length > 6) {
      let s = '我们一起把它拆小一点：\n';
      s += '1️⃣ 先说清楚，此刻最让你难受的具体是哪一件事？\n';
      s += '2️⃣ 这件事里，有哪些是你能控制的，哪些不是？\n';
      s += '3️⃣ 从能控制的那部分里，挑一个 10 分钟就能开始的小动作。\n';
      if (scan.length) s += `\n我听到你提到的关键词指向 <b>${scan[0].n}</b>——要不要就先写下来，我们一条条看？`;
      return s;
    }

    let reply = '';
    // 共情开头
    if (neg > pos) {
      const openers = [
        '听起来这段时间真的挺不容易的。',
        '我能感觉到你现在的状态有点沉。',
        '这种感觉一定很难熬，谢谢你愿意说出来。',
        '被这种情绪压着的时候，光是撑着就已经很费力了。'
      ];
      reply += openers[Math.floor(Math.random() * openers.length)];
    } else if (pos > neg) {
      const openers = [
        '这个消息让我也跟着高兴了一下 ☀️',
        '真好，这种时刻值得被记住。',
        '听起来你今天的状态不错。'
      ];
      reply += openers[Math.floor(Math.random() * openers.length)];
    } else {
      reply += '我在听。';
    }

    // 反射内容
    if (t.length > 8) {
      const core = t.replace(/[，。！？、,.!?]/g, ' ').trim().slice(0, 26);
      reply += `你刚才说的是「${core}…」，`;
      reply += neg > pos ? '光是把这些写出来，本身就需要一点力气。' : '我大概理解你在说什么。';
    }

    // 触发因素连接
    if (scan.length) {
      reply += `\n\n我注意到这似乎和 <b>${scan[0].n}</b> 有关`;
      if (ctx && ctx.recentTriggers && ctx.recentTriggers.includes(scan[0].k)) {
        reply += `——它最近在你这里出现的频率不低，可能不是偶然。`;
      } else reply += '。';
    }

    // 认知偏差
    if (dist) {
      reply += `\n\n另外想轻轻提一句：你的表达里有「${dist.name}」的味道。${dist.tip}`;
    }

    // 收尾 + 小建议
    const closers = neg > pos
      ? ['\n\n想试试现在做 3 分钟呼吸练习吗？就在这里，不用任何准备。',
         '\n\n如果不想分析原因也没关系，我们可以就待一会儿。你想继续说，还是先歇一歇？',
         '\n\n要不要先把脑子里转的东西倒出来？写下来会比在脑子里转轻一些。']
      : ['\n\n想多聊聊细节吗？我很想听。',
         '\n\n把好的部分也写进日记吧，以后低落的时候可以回来看看。'];
    reply += closers[Math.floor(Math.random() * closers.length)];
    return reply;
  }
};
