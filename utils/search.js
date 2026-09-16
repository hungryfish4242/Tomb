// 帝陵检索（PRD §4.6 F-06）。小程序与浏览器镜像共用这一份（UMD）。
// 只做"在已有字段里找匹配"，不猜、不补全、不引入任何数据集之外的名字。
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = { createSearch: api };
  else root.Search = { createSearch: api };
}(typeof self !== 'undefined' ? self : this, function () {
  // 档位顺序即优先级：陵名 > 皇帝称谓（名/庙号/谥号）> 朝代 > 地名。
  // 命中的是哪一档必须回传给界面——用户看到"北京"命中一堆时，需要知道那是地名命中而非陵名。
  const TIERS = [
    { key: 'tomb', label: '陵名' },
    { key: 'emperor', label: '皇帝称谓' },
    { key: 'dynasty', label: '朝代·政权' },
    { key: 'place', label: '地名' }
  ];
  const LIMIT = 20;
  const EMPTY_HINT = '输入陵名、皇帝名或庙号、朝代、省市县名均可（如「茂陵」「李世民」「北魏」「洛阳」）';
  const NO_RESULT = '没有匹配的帝陵。可试陵名（茂陵）、皇帝（刘彻）、庙号（汉武帝）、朝代（西汉）或地名（咸阳）。';

  // 检索必须容得下人打字的习惯：全角空格、间隔号、括号注释、多余空格都不该造成"搜不到"。
  // 这类假阴性比搜不到更糟——用户会以为数据库没有这条。
  function norm(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/[\s·、,，.。'’“”\-_()（）\[\]【】/　]+/g, '');
  }

  /** 每座陵预先摊平成"档位 → 待匹配串数组"，检索时只做包含判断 */
  const FIELDS = {
    tomb: m => [m.name_cn, m.name_en, m.doc && m.doc.tomb_name],
    // 皇帝称谓档覆盖本名、庙号、谥号、俗称——它们都散在 emperor_note 与 doc.emperor 的原文里
    // （「汉武帝刘彻」「清高宗 弘历（乾隆帝）」），拆字段容易漏，整串匹配反而稳。
    // 但这句话只对"一个主"成立：多主陵的 emperor_note 是一句概括（「西夏诸帝（陵区，含九座帝陵）」），
    // 九个人的名字一个都不在里面，搜「李纯佑」因此搜不到——那是假阴性，用户会读成"库里没这个人"。
    // 所以逐主的名与称谓在 buildRow 里另接一路（见下），不塞进这张表：这张表读的是陵级原文。
    emperor: m => [m.emperor_note, m.doc && m.doc.emperor],
    dynasty: m => [m.state, m.dynasty_code],
    place: m => [m.province, m.city, m.county, m.doc && m.doc.location]
  };
  function buildRow(m, T) {
    const buckets = {};
    for (const t of TIERS) {
      buckets[t.key] = FIELDS[t.key](m).filter(Boolean).map(norm).filter(Boolean);
    }
    // 陵主只经 utils/tombs.js 那一个出口取（check_lords §7 钉着：不许有第二个文件读 lords.js）。
    // 并进皇帝称谓档而不是新开一档：优先级 陵名>称谓>朝代>地名 是文档口径，为陵主改它不值。
    for (const r of (T.lordsOf ? T.lordsOf(m.id) : [])) {
      for (const s of [r.lord, r.call]) {
        const n = norm(s);
        if (n && buckets.emperor.indexOf(n) < 0) buckets.emperor.push(n);
      }
    }
    return { row: m, buckets };
  }

  /**
   * @param tombs utils/tombs.js createTombs() 的返回值——用它的 all（219 座全量，含无坐标的 21 座），
   *   并用它的 lordsOf() 取逐主行（检索不许自己读 lords.js）。
   *   检索不许只覆盖"能上图的"：无坐标的陵同样该被搜到，否则搜索成了地图的从属功能。
   */
  function createSearch(tombs, limit) {
    const cap = limit || LIMIT;
    const rows = tombs.all.map(m => buildRow(m, tombs));

    function search(q) {
      const nq = norm(q);
      if (!nq) return [];
      const hits = [];
      for (const r of rows) {
        let tier = -1, field = '';
        for (let i = 0; i < TIERS.length && tier < 0; i++) {
          const key = TIERS[i].key;
          for (const s of r.buckets[key]) {
            if (s.indexOf(nq) >= 0) { tier = i; field = key; break; }
          }
        }
        if (tier < 0) continue;
        // 同档内再分强弱：以词头开始（前缀）优先于正文包含，
        // 否则搜「汉」会把「汉云陵」排在「汉高祖长陵」之前——名字更长的反而先出。
        const starts = r.buckets[field].some(s => s.indexOf(nq) === 0);
        const m = r.row;
        hits.push({
          id: m.id, name: m.name_cn, badge: m.badge, color: m.color,
          state: m.state || '', emperor: m.emperor_note || '', place: m.place || '',
          tier, tierLabel: TIERS[tier].label, field, prefix: starts,
          hasCoord: m.lat != null, approx: !!m.approx_pin
        });
      }
      hits.sort((a, b) => a.tier - b.tier
        || (b.prefix - a.prefix)
        || a.name.localeCompare(b.name, 'zh'));
      return hits.slice(0, cap);
    }

    return {
      search, norm, TIERS, LIMIT: cap, EMPTY_HINT, NO_RESULT,
      indexed: rows.length
    };
  }

  return createSearch;
}));
