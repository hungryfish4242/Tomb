// 皇帝对比卡（PRD §4.7 F-07-1：任选 2–3 位皇帝并排对比）。UMD，小程序与浏览器镜像共用这一份。
//
// 整张卡的措辞与"哪一格该空着"的判断为什么住在这里：并排对比最容易出事的地方就是空格——
// 空白会被读成"史料说没有"，而本项目里它几乎总是"这一列源里没有"（PRD §9.1）。
// 所以每一格要么给带出处的值，要么给 ⚠️ 并说明为什么没有，绝不用模型记忆补一句通顺的话。
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Compare = api;
}(typeof self !== 'undefined' ? self : this, function () {
  // PRD 原文就是"2–3 位"，所以上限 3、下限 2：少于 2 位时页面显示"再选一位"而不是画一张单列表
  const MAX = 3;
  const MIN = 2;

  const norm = list => (Array.isArray(list) ? list.filter(Boolean).slice(0, MAX) : []);

  /**
   * 加入一位。返回 {list, msg}——满了或重复都必须给一句要显示出来的话：
   * 静默失败会被读成"按钮没反应"，用户不知道是自己点错了还是程序坏了。
   */
  function addId(list, id) {
    const cur = norm(list);
    if (!id) return { list: cur, msg: '没有可加入的陵：请从帝陵卡片或详情页点「加入对比」。' };
    if (cur.indexOf(id) >= 0) return { list: cur, msg: '这座已经在对比里了（最多 ' + MAX + ' 位）。' };
    if (cur.length >= MAX) return { list: cur, msg: '最多并排 ' + MAX + ' 位，先移掉一位再加。' };
    return { list: cur.concat([id]), msg: null };
  }
  function removeId(list, id) { return norm(list).filter(x => x !== id); }

  /** 从已连接的陵里挑几位做默认对比：取排序后的前 MAX 座，保证两端首屏同一份 */
  function defaultSelection(tombs) {
    return tombs.all.filter(m => m.lat != null && tombs.starOf(m.id))
      .slice(0, MAX).map(m => m.id);
  }

  /**
   * @param tombs createTombs() 的实例。生卒/享年/即位/在位区间四格直接从
   *              tombs.bioRows() 取——详情页已经用它，另拼一遍必然长成两套措辞。
   */
  function createCompare(tombs) {
    const MISS = tombs.MISS;
    const cellsOf = id => { const r = tombs.bioRows(id); return r ? r.rows : []; };
    const pick = (rows, k) => rows.find(r => r.k === k) || { k, v: MISS, from: null };

    // 行的顺序与标签都在这张表里：小程序模板与镜像都按它渲染，加一行只改一处。
    const ROWS = [
      { k: '朝代', get: m => m.state || MISS, from: () => '考录文档' },
      { k: '皇帝称谓', get: m => m.emperor_note || MISS, from: () => '考录文档' },
      { k: '地理位置', get: m => m.place || MISS, from: () => '考录文档（省／市／县）' },
      { k: '坐标档位', get: m => (m.lat == null ? '无可上图坐标'
          : m.approx_pin ? '仅市级行政质心（不上图）' : '本体坐标'), from: () => '本项目分档纪律' },
      { k: '下葬年份', get: m => (m.doc && m.doc.burial_year) || MISS, from: () => '考录文档原文' },
      { k: '生卒年', bio: '生卒年' },
      { k: '享年', bio: '享年' },
      { k: '即位年', bio: '即位年' },
      { k: '在位区间', bio: '在位区间' },
      { k: '在位时长', bio: '在位时长' },
      { k: '葬年核对', bio: '葬年核对' },
      { k: '是否对外开放', get: m => (m.doc && m.doc.access)
          || (m.open_to_public == null ? MISS : m.open_to_public ? '对外开放' : '不对外开放'),
        from: () => '考录文档' },
      // PRD 要的"陵寝形制"整列无源：《中国历代皇帝陵信息整理》实测只有 6 列、没有形制列，
      // 数据集也没有任何建筑规格字段。留一格明写没有，比悄悄删掉这一行诚实。
      { k: '陵寝形制', get: () => MISS, from: () => '整理文档无此列，本项目不据此造描述' }
    ];

    function column(id) {
      const m = tombs.byId.get(id);
      if (!m) return null;
      const bioCells = cellsOf(id);
      const star = tombs.starOf(id);
      // 星图那一格走导航判据（身份唯一即可），CBDB 号仍走年份判据——两者不是一回事：
      // 清世宗的陵能跳去看他的关系图，卡片上却仍不该有 CBDB 卒年。
      const jump = tombs.starJump(id);
      // 多主陵的「生卒年」不端单值：一个数代表不了 N 个人。措辞取自 lordPointer，
      // 与详情页只差指针落点（那边逐主就在下面，这边的逐主在详情页）。
      const ptr = tombs.lordPointer(id, '逐主见详情', '详情页的「陵主」一节');
      const cells = ROWS.map(r => {
        const src = r.bio ? pick(bioCells, r.bio) : null;
        const v = src ? src.v : r.get(m);
        const from = src ? (src.from || 'CBDB（经帝陵↔CBDB 生平连接）') : r.from(m);
        if (ptr && r.k === '生卒年') return { k: r.k, v: ptr.life, from: ptr.lifeFrom, missing: false };
        if (ptr && r.k === '下葬年份' && v === MISS && ptr.burial) {
          return { k: r.k, v: ptr.burial, from: ptr.burialFrom, missing: false };
        }
        return { k: r.k, v, from, missing: String(v).indexOf(MISS) >= 0 };
      });
      return {
        id, name: m.name_cn, nameEn: m.name_en || '', badge: m.badge, color: m.color,
        linked: !!bioCells.length, cbdbId: star ? star.cbdbId : null,
        emperorId: jump ? jump.emperorId : null,
        hasCoord: m.lat != null, approx: !!m.approx_pin,
        forgotten: !!m.forgotten_flag, certainty: m.certaintyLabel, type: m.typeLabel,
        cells
      };
    }

    /** 两两直线距离。共用 tombs.pairDistance，舍入与"不给数字"的三条规则只有一份。 */
    function pairs(cols) {
      const out = [];
      for (let i = 0; i < cols.length; i++) {
        for (let j = i + 1; j < cols.length; j++) {
          const a = tombs.byId.get(cols[i].id), b = tombs.byId.get(cols[j].id);
          const pd = tombs.pairDistance(a, b);
          out.push({
            a: cols[i].name, b: cols[j].name, text: pd.text, km: pd.km, note: pd.note,
            label: cols[i].name + ' ↔ ' + cols[j].name
          });
        }
      }
      return out;
    }

    /**
     * 常驻说明（PRD §9.1 的做法：把"少画了什么"说出来）。数字全部现算自产物 meta，
     * 写死就会在下次重建管线时变成假话。
     */
    function note(cols) {
      const meta = tombs.BIO_META || {};
      const linked = cols.filter(c => c.linked).length;
      const parts = [];
      parts.push('本卡并排 ' + cols.length + ' 位，其中 ' + linked + ' 位连上了 CBDB 生平记录'
        + '（双源互证；连上星图的只占其中一部分，其余没有星图节点）；'
        + '未连上的那 ' + (cols.length - linked) + ' 位不生成任何生平内容——'
        + '全库 ' + tombs.counts.total + ' 座里连上的共 ' + tombs.BIO_LINKED + ' 座。');
      parts.push('在位两行口径不同：「在位区间」只搬 CBDB「皇帝」任命条自带的起始年／终止年，'
        + '有任命条的 ' + (meta.reign_rows || '?') + ' 位里终止年非零的只有 ' + (meta.reign_with_end || 0)
        + ' 位（' + (meta.reign_multi || 0) + ' 位复辟故多段并列），缺的就写"CBDB 未记"；'
        + '「在位时长」是本项目的减法，优先用上面那个终止年，CBDB 缺止年时以卒年为限——'
        + '那种行标着「至崩」，崩于位的准，禅位或被废的偏大。'
        + '现有 ' + (meta.reign_span_from_cbdb || 0) + ' 位用 CBDB 止年、'
        + (meta.reign_span_approx || 0) + ' 位以卒年为限。');
      parts.push('生卒与享年同为 CBDB 原值（享年直接采用 YearsLived，不分虚岁实岁）；'
        + '下葬年份取考录文档原文——CBDB 没有"下葬年"这个字段，所以两种口径并列同屏，'
        + '「葬年核对」那一格专管两者差几年（互差 >1 年的 ' + (meta.year_conflict || 0) + ' 行）。');
      parts.push('距离是 WGS-84 大圆直线距离，不是路程；任一端只有市级质心时不给数字，'
        + '因为那算的是两个市政府之间的距离。');
      parts.push('「陵寝形制」整列无源（整理文档实测只有 6 列，没有形制列），按 §9.1 标未获取而非写一段描述。');
      return parts.join(' ');
    }

    /** 页面直接可用的视图模型 */
    function view(ids) {
      const cols = norm(ids).map(column).filter(Boolean);
      /**
       * 表按"行"转置一次给界面：并排对比读的是同一格在不同人身上差在哪。
       * 出处逐格带着走——即位年那一行，刘邦是「開國君主」、刘盈是「繼位」，
       * 合成一个行级出处就成假话了。
       */
      const table = ROWS.map(r => ({
        k: r.k,
        vals: cols.map(c => {
          const cell = c.cells.find(x => x.k === r.k) || { v: MISS, from: null, missing: true };
          return { v: cell.v, from: cell.from, missing: cell.missing };
        })
      }));
      return {
        columns: cols,
        table,
        pairs: pairs(cols),
        enough: cols.length >= MIN,
        need: cols.length < MIN ? ('再选 ' + (MIN - cols.length) + ' 位即可并排对比（最多 ' + MAX + ' 位）。') : '',
        note: cols.length ? note(cols) : '',
        limit: MAX,
        stats: {
          linked: cols.filter(c => c.linked).length, total: cols.length,
          pool: tombs.BIO_LINKED, all: tombs.counts.total
        }
      };
    }

    return { MAX, MIN, ROWS, column, pairs, view, note, defaultSelection, addId, removeId };
  }

  return { MAX, MIN, addId, removeId, norm, createCompare };
}));
