// 时间轴视图模型（PRD §4.2 F-02 / §6.1 年份口径）。小程序与浏览器镜像共用这一份（UMD）。
// 只做「已有事实的解析与排序」，不新增任何事实：年份一律取自 doc.burial_year
// （《中国历代皇帝陵信息整理.md》的考录列，每格自带出处链接），解析不出的绝不猜。
(function (root, factory) {
  const api = factory();
  // 纯函数（parseBurial / formatYear / centuryOf / centuryLabel）不依赖任何数据，
  // 因此既挂在模块导出上、也挂在 createTimeline() 的实例上：
  // 只挂实例会逼调用方为了拿一个解析器去伪造一个 tombs 对象。
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Timeline = api;
}(typeof self !== 'undefined' ? self : this, function () {
  // 文档里的人手写形态（实测枚举，见 check_timeline.js 的样本锁）：
  //   「公元前210年」「前87年」「499年」「57年」「25年（卒）」「532年废杀」
  //   「532年（葬用王礼）」「1995年1月26日自八宝山迁葬」「约580年后」「公元6年」

  /**
   * 把一个人手写的下葬年解析成可排序的天文年份（公元前 = 负数）。
   * @returns {{year: number|null, raw: string, relocated: boolean, cause: string}}
   *   relocated 为真表示这个年份是**迁葬**年而非下葬年（清溥仪墓那条），必须单独标注；
   *   cause 记录解析不出的原因，供「年份待核」的措辞使用。
   */
  function parseBurial(raw) {
    const text = String(raw == null ? '' : raw).trim();
    const out = { year: null, raw: text, relocated: false, cause: '' };
    if (!text) { out.cause = '文档无下葬年记载'; return out; }
    out.relocated = /迁葬/.test(text);
    let m = text.match(/(?:公元)?前\s*(\d{1,4})\s*年?/) || text.match(/^公元前\s*(\d{1,4})/);
    if (m) { out.year = -parseInt(m[1], 10); return out; }
    m = text.match(/公元\s*(\d{1,4})\s*年?/) || text.match(/^(\d{1,4})\s*年/);
    if (m) { out.year = parseInt(m[1], 10); return out; }
    out.cause = '年份形态无法解析：' + text;
    return out;
  }

  /** §6.1：公元前与公元连续表达，界面上不许出现「0 年」 */
  function formatYear(y) {
    if (y == null) return '';
    return y < 0 ? '公元前' + (-y) + '年' : '公元' + y + '年';
  }
  /** 世纪（含公元前）：-87 → 前2世纪，1 → 1世纪，499 → 5世纪 */
  function centuryOf(y) {
    return y > 0 ? Math.ceil(y / 100) : Math.ceil(y / 100) - 1;
  }
  function centuryLabel(c) {
    return c < 0 ? '前' + (-c) + '世纪' : c + '世纪';
  }

  /**
   * F-02-5 输入框里的年份：认得轴上那几种人手写法，也认裸数字与负数。
   * 认不出就明说，绝不猜——猜一个年份等于替文档编一个出处（§9.1）。
   * @returns {{year: number|null, msg: string}} msg 非空即解析失败，直接显示给用户
   */
  function parseYearInput(text) {
    const t = String(text == null ? '' : text).trim();
    if (!t) return { year: null, msg: '' };
    if (/^-?\d{1,4}$/.test(t)) {
      const n = parseInt(t, 10);
      // 没有公元 0 年：§6.1 要求轴上不许出现它，输入侧就得挡住
      if (n === 0) return { year: null, msg: '没有公元 0 年（公元前的年请写「前1」这样）' };
      return { year: n, msg: '' };
    }
    const p = parseBurial(t);
    if (p.year != null) return { year: p.year, msg: '' };
    return { year: null, msg: '看不出是哪一年：' + t + '（可写「386」「前386」「公元386年」）' };
  }

  /**
   * 区间生效时挂在轴上方那句。待核座数必须报出来：F-02-1 要求 218 座全在轴上，
   * 区间一开就有 N 座没有可判的年份——悄悄消失等于把 44 座说没了。
   */
  function rangeNote(from, to, kept, excludedPending) {
    if (from == null && to == null) return '';
    const span = from == null ? '至 ' + formatYear(to)
      : to == null ? '自 ' + formatYear(from)
        : formatYear(from) + ' — ' + formatYear(to);
    return '区间 ' + span + '：轴上 ' + kept + ' 座'
      + (excludedPending ? '；另 ' + excludedPending
        + ' 座年份待核，判不出在不在区间内，故不列（清掉区间即回）' : '');
  }

  // 轴上必须常驻的三句文案。两端各写一遍必然漂移（GEO_LEGEND 同一条纪律），所以住在这里。
  // 时间口径尤其要紧：F-02-3 要的「生卒年」在帝陵侧根本没有字段，不写清楚，
  // 读者就会把下葬年当成生卒年读（PRD §9.1 不许、§9.2 要标清档位）。
  const AXIS_NOTE = '轴上时间＝下葬年，取自《中国历代皇帝陵信息整理》每格自带的考录出处；'
    + '生卒年与在位年在详情页的生平一节里（取自 CBDB，只覆盖连上生平表的那些座），本视图不假充。'
    + '节点按时间先后排列，不按时间比例铺开——6 世纪挤着 38 座、11–13 世纪只有 7 座，'
    + '按比例画会让前者糊成一团、后者空成一段假白。';
  const RELOCATED_TAG = '迁葬年';
  const PENDING_TAG = '年份待核';

  /**
   * @param tombs utils/tombs.js createTombs() 的返回值——朝代色与徽章一律从它取，
   *        这里不自建配色表（两份颜色必然漂移，且 §7.2 要求颜色不得单独承担区分职责）。
   */
  function createTimeline(tombs) {
    const items = [];
    for (const m of tombs.all) {
      const raw = m.doc && m.doc.burial_year;
      const p = parseBurial(raw);
      items.push({
        id: m.id, name: m.name_cn, badge: m.badge, color: m.color,
        state: m.state || '', dynasty_code: m.dynasty_code || 'uncertain',
        place: m.place || '', year: p.year, yearText: formatYear(p.year),
        raw: p.raw, relocated: p.relocated, cause: p.cause,
        undated: p.year === null, hasCoord: m.lat != null,
        approx: !!m.approx_pin, certainty: m.certainty, forgotten: !!m.forgotten_flag,
        accessTier: (m.doc && m.doc.access_tier) || 'none'
      });
    }
    // 有年份的按年升序（公元前列负数自然就位，跨纪元不需要特判）；
    // 同年多座按陵名排，保证两端与重跑的结果一致（不依赖数组原始顺序）。
    const dated = items.filter(x => !x.undated)
      .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name, 'zh'));
    // 解析不出的按朝代聚在一起排在末尾：它们没有可排的时间，但 PRD F-02-1 要求「所有」都在轴上。
    const undatedOrder = new Map(tombs.dynastyOptions.map((d, i) => [d.code, i]));
    const undated = items.filter(x => x.undated)
      .sort((a, b) => (undatedOrder.get(a.dynasty_code) ?? 99) - (undatedOrder.get(b.dynasty_code) ?? 99)
        || a.name.localeCompare(b.name, 'zh'));

    // 朝代色带（F-02-4）：只按**已解析出的**年份算起止，没有年份的不进带——
    // 否则一个错年就把色带拉长几十年，而色带读起来是"这个政权占这段时间"的断言。
    const bandMap = new Map();
    for (const x of dated) {
      const cur = bandMap.get(x.dynasty_code);
      if (!cur) bandMap.set(x.dynasty_code, { code: x.dynasty_code, label: x.state, color: x.color, start: x.year, end: x.year, count: 1 });
      else {
        cur.start = Math.min(cur.start, x.year); cur.end = Math.max(cur.end, x.year); cur.count++;
      }
    }
    const bands = [...bandMap.values()].sort((a, b) => a.start - b.start);

    const centuries = [];
    for (const x of dated) {
      const c = centuryOf(x.year);
      if (!centuries.length || centuries[centuries.length - 1].c !== c) centuries.push({ c, label: centuryLabel(c), count: 1 });
      else centuries[centuries.length - 1].count++;
    }

    // 筛选四维与地图页完全同名同义（PRD §3.2 要求切换视图时筛选状态保持）：
    // 这里筛的是时间轴行，不能借用 tombs.applyFilters——那个只覆盖有坐标的 198 座，
    // 而时间轴按 F-02-1 必须容下全部 218 座，含无坐标的 20 座。
    function filterRows(rows, opts) {
      const o = opts || {};
      const dyn = o.dynasty == null ? [] : (Array.isArray(o.dynasty) ? o.dynasty : [o.dynasty]);
      // F-02-5 区间：任一端为空即该侧不限。没有年份的行在区间生效时一律不出列
      // （判不出在不在区间内），这个取舍由 rangeNote 报数，不静默吞掉。
      const num = v => (v == null || v === '' || !isFinite(Number(v)) ? null : Number(v));
      const from = num(o.yearFrom);
      const to = num(o.yearTo);
      return rows.filter(x =>
        (!dyn.length || dyn.indexOf(x.dynasty_code) >= 0)
        && (!o.doubtfulOnly || x.certainty !== 'confirmed')
        && (!o.forgottenOnly || x.forgotten)
        && (!o.accessTier || x.accessTier === o.accessTier)
        && (from == null && to == null
          || (x.year != null && (from == null || x.year >= from) && (to == null || x.year <= to))));
    }

    return {
      parseBurial, formatYear, centuryOf, centuryLabel, filterRows, parseYearInput, rangeNote,
      AXIS_NOTE, RELOCATED_TAG, PENDING_TAG,
      items: dated.concat(undated), dated, undated, bands, centuries,
      stats: {
        total: items.length, dated: dated.length, undated: undated.length,
        bce: dated.filter(x => x.year < 0).length,
        relocated: dated.filter(x => x.relocated).length,
        minYear: dated.length ? dated[0].year : null,
        maxYear: dated.length ? dated[dated.length - 1].year : null,
        centuries: centuries.length
      }
    };
  }

  return { createTimeline, parseBurial, formatYear, centuryOf, centuryLabel,
    parseYearInput, rangeNote };
}));
