// 帝陵数据的展示侧派生逻辑：分档渲染、按市聚合、朝代徽章、摘要卡内容。
// 小程序与浏览器镜像共用这一份（UMD），避免「只改一边就不一致」。
// 这里只做定性判断与几何计算，不新增任何事实性数据。
(function (root, factory) {
  const api = factory(typeof require === 'function' ? null : root.GeoJS,
    typeof require === 'function' ? null : root.__EMPEROR_LINK__,
    typeof require === 'function' ? null : root.__EMPEROR_BIO__,
    typeof require === 'function' ? null : root.__LORDS__,
    typeof require === 'function' ? null : root.__WIKI_BIO__);
  if (typeof module === 'object' && module.exports) module.exports = { createTombs: api };
  else root.Tombs = { createTombs: api };
}(typeof self !== 'undefined' ? self : this, function (geoInjected, linkInjected, bioInjected, lordsInjected, wikiInjected) {
  const geo = geoInjected || require('./geo.js');
  // 帝陵↔星图皇帝连接（build_emperor_link.js 的双源自洽产物）。
  // 只有连上的那批（当前 71 座）有资格显示生卒年；其余一律「⚠️ 暂未获取」，不做最近名字兜底。
  const LINK = (linkInjected || require('./emperor_link.js')).links || {};
  // 同一份产物里的第二张表：星图**导航**（身份唯一即可，不带任何年份）。
  // 为什么分开：links 的判据是"|考录葬年 − CBDB 卒年| ≤ 2"，那是"能不能把年份挂上来"；
  // 而"点进去看这个人的关系图"只要认对人——领错图看得见，写错年看不见。
  const LINKFILE = linkInjected || require('./emperor_link.js');
  const JUMPS = LINKFILE.jumps || {};
  const BACK = LINKFILE.back || {};
  // 反查表：星图节点 → 帝陵。两向都只能由这份产物生成，页面里不许各自拼一遍。
  const REVERSE = new Map();
  for (const tombId of Object.keys(LINK)) {
    const eid = LINK[tombId].emperor_id;
    if (REVERSE.has(eid)) throw new Error('emperor_link.js 里 ' + eid + ' 同时连到 '
      + REVERSE.get(eid) + ' 与 ' + tombId + '——星图的回链只能指一座，必须先人工裁决');
    REVERSE.set(eid, tombId);
  }
  // CBDB 生平材料（build_emperor_bio.js 产物）：只含 CBDB 结构化字段与原文 Notes，
  // 本项目不改写、不补全、不用模型记忆添事实（PRD §9.1）。
  const BIOFILE = bioInjected || require('./emperor_bio.js');
  const BIO = (BIOFILE && BIOFILE.bios) || {};
  const BIO_META = (BIOFILE && BIOFILE.meta) || {};
  // 陵主侧（build_lords.js 产物）：一座陵 1..N 个主。「一陵多主拆成逐个陵主」是用户 2026-09-15
  // 的原话，这一份就是拆完的结果；名册的 emperor_note 那句中文从此只当兜底，不再当数据。
  const LORDSFILE = lordsInjected || require('./lords.js');
  const LORDS = (LORDSFILE && LORDSFILE.by_tomb_id) || {};
  // 清朝的庙号/谥号/年号/即位年：CBDB 这几项对清基本是空的，用户 2026-09-16 指令改由百科供给。
  // 每个值都带条目名 + revid + 检索日期，出处不是"维基"两个字。
  const WIKIFILE = wikiInjected || require('./wiki_bio.js');
  const WIKI = (WIKIFILE && WIKIFILE.by_tomb) || {};
  /** 帝与后同穴的陵取"有庙号的那一行"（皇帝），只有后妃时取第一行 */
  function wikiFor(id) {
    const rows = WIKI[id];
    if (!rows || !rows.length) return null;
    return rows.filter(r => r.temple)[0] || rows[0];
  }
  const wikiCite = w => '中文维基百科《' + w.article + '》信息框（revid ' + w.revid
    + '，' + w.retrieved + ' 检索）';
  /** 逐主取百科那一行：多主陵不能整座共用一行（seq 从 1 起，与「陵主」一节同一个序号） */
  function wikiRow(id, seq) {
    const rows = WIKI[id];
    if (!rows || !rows.length) return null;
    if (seq == null) return wikiFor(id);
    const w = rows.find(r => r.seq === seq);
    if (!w) return null;
    // seq 只是构建期的行序。名册一旦重排，按序号取就会把前一个人的年份挂到后一个人身上
    // （唐乾陵真把李治的 628–683 挂给过武则天），所以还要名字对得上才认这一行。
    const L = (LORDS[id] || [])[seq - 1];
    if (!L) return null;
    // 百科产物里的 lord/call 是从 lords 行逐字抄来的，所以严格相等就是最强的核对
    // （t2s_fold 是构建期模块，运行时不引它）
    return (L.lord && L.lord === w.lord) || (!!L.call && L.call === w.call) ? w : null;
  }
  /** 条目里本就两说、或给的生卒自相矛盾：值不采，但要把原文还给读者（PRD §9.1 不硬凑） */
  function wikiAmbNote(w) {
    if (!w) return null;
    const bits = [];
    if (w.birth_amb) bits.push('条目生年两说（' + w.birth_amb + '），不取其一');
    if (w.death_amb) bits.push('条目卒年两说（' + w.death_amb + '），不取其一');
    if (w.pair_bad) bits.push('条目给的生卒互相矛盾（' + w.pair_bad + '），不采用');
    return bits.length ? bits.join('；') : null;
  }
  /**
   * 生卒年的**唯一**供给口。优先级：用户两份表 / CBDB（两者已落在 BIO 与 lords 里）> 中文维基百科。
   * 三个出口——地图卡与详情的「生卒年」格、生平节那一行、陵主节逐主行——都必须读它：
   * 各读各的就会出现同一张卡一边有数、一边「⚠️ 暂未获取」。
   * 百科只填前面都没有的那一边；同时回报"这次是百科补的"与"百科和名册不一致"，
   * 行末出处才写得出来（不一致时不覆盖，只并列，与清朝那 55 行的处理同一取向）。
   */
  function lifeOf(id, seq) {
    const b = BIO[id];
    const rows = LORDS[id] || [];
    const L = rows[seq == null ? 0 : seq - 1] || null;
    // BIO 记的是"这座陵的第一主"：多主陵里第 2、3 主去读它就等于把前一个人的年份挂到后一个人身上
    // （唐乾陵真的把李治的 628–683 挂给过武则天）。逐主只认该主自己的 lords 行，第一主才回退到 BIO。
    const primary = !!(seq == null || seq === 1);
    const w = wikiRow(id, seq);
    const rBirth = L && L.birth != null ? L.birth : (primary && b && b.birth != null ? b.birth : null);
    const rDeath = L && L.death != null ? L.death : (primary && b && b.death != null ? b.death : null);
    const fromWiki = !!(w && ((rBirth == null && w.birth != null) || (rDeath == null && w.death != null)));
    const diff = w && ((w.birth != null && rBirth != null && w.birth !== rBirth)
      || (w.death != null && rDeath != null && w.death !== rDeath)) ? w : null;
    return {
      birth: rBirth != null ? rBirth : (w && w.birth != null ? w.birth : null),
      death: rDeath != null ? rDeath : (w && w.death != null ? w.death : null),
      fromWiki, diff, w, amb: wikiAmbNote(w)
    };
  }
  const LORDS_META = (LORDSFILE && LORDSFILE.meta) || {};
  const BIO_MISS = '⚠️ 暂未获取';
  const bioYear = y => (y == null ? null : (y < 0 ? '公元前' + (-y) : '公元' + y));

  /**
   * 在位区间：CBDB「皇帝」任命条自带的 FirstYear/LastYear，复辟者多段并列。
   * 终止年在那份记录里大面积是未知占位 0，因此这里明写"未记"而不是留空，也不算在位年数。
   */
  function reignText(b) {
    const rs = Array.isArray(b.reigns) ? b.reigns : [];
    if (!rs.length) return null;
    return rs.map(r => {
      const head = bioYear(r.first), tail = bioYear(r.last);
      if (!head && !tail) return '有「皇帝」任命条目、年份未记';
      return [head, tail].filter(Boolean).join('–') + (tail ? '' : '（终止年 CBDB 未记）');
    }).join('；');
  }

  /**
   * 生卒年的出处必须跟着值走。用户 2026-09-15 指定「别管 CBDB，用 emperors_birth_death.csv 核对」，
   * 所以这两个值现在多数来自那份表；**CBDB 原值不删**，两者不一致时把原值一起摆上屏
   * （16 条不一致，其中 唐简陵 的 CBDB 值生 883 > 卒 873，本身就不可能）。
   * 一处生成、两端共读，免得小程序与镜像对同一个数说出两种来历。
   */
  function lifeProvenance(b) {
    if (b.life_src !== 'user_csv') {
      return { from: 'CBDB YearBirth/YearDeath', deathLabel: 'CBDB 卒年',
        noDeath: 'CBDB 无卒年可核', src: 'CBDB 人物传记（' + b.cbdb_id + '）', noteText: '' };
    }
    const base = b.life_file === 'supplement'
      ? '用户补录表《user_lords_supplement.csv》第 ' + b.csv_line + ' 行'
      : '用户提供《emperors_birth_death.csv》第 ' + b.csv_line + ' 行（' + (b.csv_call || b.ch_name) + '）';
    const why = b.life_status === 'unknown_birth' ? '；生年不可考（不硬凑）'
      : b.life_status === 'legendary_or_disputed' ? '；传说时代或归属有争议'
        : b.life_status === 'multi_lord' ? '；多主陵，生卒年按陵主单记' : '';
    // 用户在出处列里特意写的那句（两说并存 / 仅暂安 / 归属为推定）必须上屏：
    // 「有争议要标出」这条规则落地成界面才算数，只存在库里等于没标。
    const noteText = b.life_note ? '；' + b.life_note : '';
    return {
      from: base + why + noteText + (b.life_conflict
        ? '；CBDB 原值 ' + b.life_conflict + '（生/卒）与表不一致，按用户指定取表值' : ''),
      deathLabel: '表内卒年', noDeath: '该表未给卒年', noteText,
      src: base + (b.cbdb_id ? '；CBDB 人物传记（' + b.cbdb_id + '）' : '；该陵未连上 CBDB 人物记录')
    };
  }

  /**
   * 生平与事功（PRD §4.3 基础信息 + 生平材料）。行的措辞也住在这里：
   * 小程序与镜像各拼一遍必然漂移，且"哪一格该显示未获取"这件事必须由一处决定。
   * 即位年额外标出它是从 CBDB 的哪类记录来的——没有记录就明写没有，不生造。
   */
  /**
   * 百科是否优先。**只有清朝优先**：那几格 CBDB 常是错的（皇太极年号记成「萬曆20 / 崇德8」、
   * 康熙记成「順治11 / 康熙61」），用户 2026-09-16 因此明令「相关内容去百科找 不要 cbdb 了」。
   * 百科层从 2026-09-16 起铺到全朝代，这条特例不许顺手变成通用规则——否则等于把整库史实改判给百科。
   * 判据用生平记录自带的朝代字段：只有百科行的那一节没有优先级之争，不需要查名册。
   */
  const wikiFirst = b => !!b && b.dynasty === '清';

  /** 没连上 CBDB、用户表也没有这一座时：百科供得上的那几格单独成一节，标题与口径句必须跟着换 */
  function wikiOnlyRows(id) {
    const w = wikiRow(id, 1);
    if (!w || (LORDS[id] || []).length !== 1) return null;
    const row = (k, v, from) => ({ k, v: v == null || v === '' ? BIO_MISS : v, from: from || null });
    const cite = wikiCite(w);
    const life = [bioYear(w.birth), bioYear(w.death)].filter(Boolean).join('–') || null;
    const rows = [
      row('条目人名', [w.lord, w.call].filter(Boolean).join('·'), cite),
      row('庙号', w.temple, w.temple ? cite : null),
      row('谥号', w.posthumous, w.posthumous ? cite : null),
      row('生卒年', life, life ? cite + wikiLifeNote(lifeOf(id, 1)) : null),
      row('即位年', w.accession == null ? null : bioYear(w.accession), w.accession == null ? null : cite),
      row('在位区间', w.reign, w.reign ? cite : null),
      row('年号（生/卒时）', w.era, w.era ? cite : null),
      row('条目写的陵墓', w.burial_field, w.burial_field ? cite : null)
    ];
    return {
      cbdb_id: null, retrieved: w.retrieved,
      title: '生平与事功（中文维基百科条目）',
      hint: '本座没连上 CBDB 人物记录、用户两份表也没有这一格，'
        + '上面这几项按用户 2026-09-16 指令取自维基条目信息框，逐格带条目名与版本号可回查；'
        + '条目没写的（亲属、著述、葬年核对）一律标未获取——不为 CBDB 的缺席编东西。',
      rows, notes: null
    };
  }
  /** 生卒年那格的补充说明：百科与名册不一致、或条目里本就两说 */
  function wikiLifeNote(lf) {
    const bits = [];
    if (lf.diff) bits.push('百科与名册所记不一致，按优先级取名册');
    if (lf.amb) bits.push(lf.amb);
    return bits.length ? '；' + bits.join('；') : '';
  }

  function bioRows(id) {
    const b = BIO[id];
    if (!b) return wikiOnlyRows(id);
    const row = (k, v, from) => ({ k, v: (v === null || v === undefined || v === '' ? BIO_MISS : v), from: from || null });
    // 没连上 CBDB 人物的行，就不许把 CBDB 的字段名当成出处端上去——那是在指认一个不存在的来源
    const cbFrom = t => (b.cbdb_id ? t : null);
    const wk = wikiFor(id);
    const wf = wikiFirst(b);
    /**
     * 一格该端哪个值。清朝：百科优先，CBDB 原值不删、写进行末；
     * 其余：名册（用户表/CBDB）优先，百科只填它空着的格，两边不一致就并列出来。
     */
    const pick = (cbVal, cbSrc, wVal) => {
      if (wk && wVal && (wf || !cbVal)) {
        return { v: String(wVal), from: wikiCite(wk) + (cbVal && cbVal !== String(wVal)
          ? '；' + (wf ? 'CBDB 原值「' + cbVal + '」不一致，按用户指令取百科'
            : '名册原值「' + cbVal + '」不一致，按优先级保留名册') : '') };
      }
      return { v: cbVal || null, from: cbFrom(cbSrc) };
    };
    const name = [b.ch_name, b.eng_name].filter(Boolean).join('｜');
    const lived = b.years_lived != null
      ? b.years_lived + ' 岁' + (b.years_lived_approx ? '（CBDB 标「' + b.years_lived_approx + '」）' : '')
      : null;
    const R_TEMPLE = pick(b.temple_name, 'CBDB 别名·廟號', wk && wk.temple);
    const R_POST = pick(b.post_name, 'CBDB 别名·諡號', wk && wk.posthumous);
    // CBDB 的「繼位」条偶有自相矛盾的值：劉莊(24662) 即位条记 25 年，同一份记录却写他生于 29 年，
    // 而那条的 RuShiAge=-4 正是这个串位值算出来的。数据层照原值保留（不改写来源），界面上不端出来，
    // 也不拿卒年或别的字段替它凑一个看起来正常的即位年。
    const accWrong = b.birth != null && b.accession_year != null && b.accession_year < b.birth;
    const accCb = b.accession_year != null && !accWrong
      ? bioYear(b.accession_year) + (b.accession_age > 0 ? '（' + b.accession_age + ' 岁）' : '') : null;
    const accCbFrom = accWrong
      ? 'CBDB 即位条原值 ' + b.accession_year + ' 早于同记录的生年 ' + b.birth + '，自相矛盾，不采用'
      : (b.accession_via || null);
    const lf = lifeOf(id, (LORDS[id] || []).length === 1 ? 1 : null);
    // 条目把「在位」分成多段时百科不落即位年（见 build_wiki_bio.js）：那一格不能只留
    // 「暂未获取」——要写清这不是没查，是不替读者猜
    const accNote = wk && wk.accession == null && (wk.reign_segments || 0) > 1
      ? '；条目「在位」分 ' + wk.reign_segments + ' 段、起年不一，不取其一' : '';
    const R_ACC = pick(accCb, accCbFrom, wk && wk.accession != null ? bioYear(wk.accession) : null);
    // 百科补上即位年时，CBDB 那一侧发生过什么也要说：读者只看"百科说 820"会以为 CBDB 什么都没写
    if (R_ACC.v && !accCb && accCbFrom) R_ACC.from = (R_ACC.from || '') + '；' + accCbFrom;
    if (accNote && !R_ACC.v) R_ACC.from = ((R_ACC.from || '') + accNote).replace(/^；/, '') || null;
    const R_ERA = pick([b.era_birth, b.era_death].filter(Boolean).join(' / ') || null, null,
      wk && wk.era ? '在位年号 ' + wk.era : null);
    const R_REIGN = pick(reignText(b), 'CBDB「皇帝」任命 FirstYear/LastYear', wk && wk.reign);
    const rows = [
        row(b.cbdb_id ? 'CBDB 人名' : '表内人名', name),
        row('庙号', R_TEMPLE.v, R_TEMPLE.from),
        row('谥号', R_POST.v, R_POST.from),
        row('别名', Array.isArray(b.aliases) && b.aliases.length ? b.aliases.join('、') : null),
        // 生卒年只从 lifeOf 出：基本信息那一格与「陵主」一节读的是同一个口子，
        // 这一行再自己拼一遍就会长成两套话
        row('生卒年', [bioYear(lf.birth), bioYear(lf.death)].filter(Boolean).join('–') || null,
          (lf.fromWiki ? wikiCite(lf.w) + '；这一格用户两份表与人物记录里都没有，按 2026-09-16 指令由百科补'
            : lifeProvenance(b).from) + wikiLifeNote(lf)),
        row('享年', lived, cbFrom('CBDB YearsLived（原值，本项目不另算虚/实岁）')),
        row('即位年', R_ACC.v, R_ACC.from),
        // 只搬 CBDB 任命条自带的两个年份；终止年是 CBDB 的未知占位就明写没记。
        // 清朝 CBDB 连任命条都没有 → 用百科信息框的「在位」那一段，出处写明是百科。
        row('在位区间', R_REIGN.v, R_REIGN.from),
        // 在位时长是构建期算好的（reign_span），这里只负责把它说清：
        // CBDB 自己记的止年与"以卒年为限"的近似是两种口径，措辞不能一样
        row('在位时长', b.reign_span
          ? b.reign_span.years + ' 年（' + [bioYear(b.reign_span.first), bioYear(b.reign_span.last)]
              .filter(Boolean).join('–')
              + (b.reign_span.segments > 1 ? '，' + b.reign_span.segments + ' 段合计' : '')
              + (b.reign_span.approx ? '，至崩' : '') + '）'
          : null,
          b.reign_span ? b.reign_span.basis : null),
        row('年号（生/卒时）', R_ERA.v, R_ERA.from),
        // 葬年与卒年是两件事，谁也不覆盖谁：CBDB 根本没有"下葬年"字段，
        // 它能核对的是"卒年与考录葬年差几年"。位置一律不端（CBDB 的籍贯不是陵址）。
        row('葬年核对', b.burial_doc == null ? null
          : (b.death == null ? '考录葬年 ' + bioYear(b.burial_doc) + '，' + lifeProvenance(b).noDeath
            : b.burial_delta === 0 ? '考录葬年与' + lifeProvenance(b).deathLabel + '同年'
              : '考录葬年 ' + bioYear(b.burial_doc) + '，' + lifeProvenance(b).deathLabel + ' ' + bioYear(b.death)
                + '，相差 ' + Math.abs(b.burial_delta) + ' 年'),
          b.burial_doc == null ? null : '《中国历代皇帝陵信息整理》葬年 × ' + lifeProvenance(b).deathLabel),
        row(b.cbdb_id ? '亲属（CBDB 记 ' + (b.kin_count || 0) + ' 条，取样）' : '亲属',
          b.kin_sample && b.kin_sample.length ? b.kin_sample.join('；') : null),
        row('著述', b.texts && b.texts.length ? b.texts.join('；') : null),
        row('CBDB 引据', b.cbdb_sources && b.cbdb_sources.length ? b.cbdb_sources.join('；') : null)
    ];
    // 百科这一档到底供了哪几格，只能从建好的行里按行末出处反推：另外判一遍条件就是第二套口径，
    // 两处一漂，标题与口径句就会替一格没供过值的字段背书——雍正帝的信息框就没有「年號」那一项。
    const gave = rows.filter(r => /维基百科/.test(String(r.from || ''))).map(r => r.k);
    return {
      cbdb_id: b.cbdb_id, retrieved: BIO_META.retrieved || '',
      // 小节标题与口径句必须由记录自己的来源决定，且只能住在这里：
      // 两端各写一份时它写的是「本节全部取自 CBDB 人物记录」——
      // 而 55 座只因用户两份表命中才有生平，CBDB 一个人物记录都没有。
      title: '生平与事功（' + (gave.length
        ? [(b.cbdb_id ? 'CBDB' : '用户提供的表'), '中文维基百科'].join(' ＋ ')
        : b.cbdb_id ? 'CBDB 人物记录' : '用户提供的表') + '）',
      hint: (gave.length
          ? '本座的' + gave.join('、') + '按用户 2026-09-16 指令取自中文维基百科条目信息框'
            + '（CBDB 这几项对清基本是空的）；这几格的行末写明条目名与版本号，可回查。'
          : '')
        + (b.cbdb_id
          ? '本节以 CBDB 人物记录为骨架（检索日 ' + (BIO_META.retrieved || '') + '），'
            + (b.life_src === 'user_csv'
              ? '生卒年按用户 2026-09-15 指定改由用户提供的表给出；'
              : '生卒年即该记录的 YearBirth/YearDeath；')
            + '本项目不改写、不补全，每行的出处写在行末；'
            + '标「⚠️ 暂未获取」的格子是这一格无源，不是我们没填。'
          : '本座没连上 CBDB 人物记录，本节的人名与生卒年全部来自用户提供的表；'
            + '其余字段两份用户表都没有载，一律标未获取——不是我们没填。'),
      rows,
      // Notes 是 CBDB 自己的说明文字，逐字保留并注明出处，不译不写
      notes: b.notes || null
    };
  }
  const fmtYear = y => (y == null ? null : (y < 0 ? '公元前' + (-y) + '年' : '公元' + y + '年'));
  // 陵主一节的短年份：西夏陵那一组九行，用「公元963年–公元1004年」会把一屏撑满，
  // 而这一节要让人横向比着看谁和谁同年。两端的"哪个数没有源"仍由状态码说，不用问号占位。
  const shortYear = y => (y == null ? null : (y < 0 ? '前' + (-y) : String(y)));
  // 状态码是用户 2026-09-15 分的三类，各自是一件事，不许塌成同一句话
  const LORD_STATUS_WHY = {
    unknown_birth: '生年不可考（不硬凑）',
    unknown_burial: '史无葬年之载（不用卒年冒充）',
    unknown_years: '生卒年均无载',
    legendary_or_disputed: '传说时代或归属有争议，不填公历纪年'
  };
  // 有年份时状态码仍要跟着说，且换一种说法：「不填公历纪年」配一个已填的数字就是自相矛盾。
  // 只写「1344」会被读成生卒齐全，只写「1162–1227」会被读成已定谳——那正是用户分开记的事。
  const LORD_YEAR_WHY = {
    unknown_birth: '生年不可考（不硬凑）',
    legendary_or_disputed: '传说或归属有争议'
  };

  /**
   * 「陵主」一节：一座陵 1..N 个主，逐主一行（名·称·生卒·葬·状态·归属置信·出处）。
   * 名册那句 emperor_note 把九主挤成一串，这一节才是它落成数据的地方；
   * 措辞只在这一处生成，小程序与镜像共读，两端各拼一遍必然漂移。
   */
  function lordRows(id) {
    const rows = LORDS[id];
    if (!rows || !rows.length) return null;
    return rows.map((r, i) => {
      const who = [r.call, r.lord].filter(Boolean).join(' ');
      const lf = lifeOf(id, i + 1);
      const life = lf.birth != null && lf.death != null ? shortYear(lf.birth) + '–' + shortYear(lf.death)
        : lf.death != null ? '卒 ' + shortYear(lf.death)
          : lf.birth != null ? '生 ' + shortYear(lf.birth) : null;
      const bits = [life || LORD_STATUS_WHY[r.status] || BIO_MISS];
      if (life && LORD_YEAR_WHY[r.status]) bits.push(LORD_YEAR_WHY[r.status]);
      // 名册说"无载/不可考"而这一行现在有了数字，那数字不是名册给的——状态码不许悄悄消失
      if (life && lf.fromWiki && (r.status === 'unknown_years' || r.status === 'unknown_birth')) {
        bits.push('名册原标' + (r.status === 'unknown_years' ? '生卒均无载' : '生年不可考') + '，此年取自百科');
      }
      if (r.burial != null) bits.push('葬 ' + shortYear(r.burial));
      else if (r.status === 'unknown_burial') bits.push('葬年无载');
      if (r.attribution === 'presumed') bits.push('归属推定');
      const from = [];
      // 名与年常来自同一份材料的同一行（西夏陵九主、南唐二陵那类）：写两遍只是把一屏撑满
      const same = r.src && r.src === r.ysrc && r.line === r.yline;
      if (same) from.push('名与年：' + (LORDS_META.source_labels[r.src] || r.src)
        + (r.yline ? ' 第 ' + r.yline + ' 行' : ''));
      else {
        if (r.src && r.src !== 'roster') from.push('名：' + (LORDS_META.source_labels[r.src] || r.src));
        if (r.ysrc) from.push('年：' + (LORDS_META.source_labels[r.ysrc] || r.ysrc)
          + (r.yline ? ' 第 ' + r.yline + ' 行' : ''));
      }
      // 年份由百科补的那一格，出处要指到条目与版本号——它不是名册给的
      if (lf.fromWiki) from.push('年：' + wikiCite(lf.w) + '（名册两份表与人物记录均无此格）');
      if (lf.amb) from.push(lf.amb);
      if (r.note) from.push(r.note);
      const v = bits.join('｜');
      return { seq: i + 1, k: who || BIO_MISS, v, from: from.join('；') || null,
        missing: v.indexOf(BIO_MISS) >= 0 };
    });
  }
  /** 产物里这一座的原始陵主行：「几主有生卒年」这类话由它现算，不靠数行数猜 */
  const lordsOf = id => LORDS[id] || [];

  /**
   * 多主陵的「生卒年」「下葬年份」两格：一个数代表不了 N 个人，整格空着又会被读成
   * "史料说没有"，所以给带分母的计数 + 一句"去哪儿看逐主"。
   * 措辞只在这里拼一次：详情页（逐主就在下面）与对比卡（逐主在详情页）读同一份计数，
   * 只差指针落点——两处各拼一遍就会长成两套话（compare.js 顶上的注释说的就是这件事）。
   * @param tail 指针后半句，如「逐主见下」／「逐主见详情」
   * @param sec  那一节的称呼，写进出处里，如「「陵主」一节」
   * @return 单主陵返回 null（那一格照旧端出那一个人的年份）
   */
  function lordPointer(id, tail, sec) {
    const rows = lordsOf(id);
    if (rows.length < 2) return null;
    // 数的是「陵主」一节真正会显示年份的那几行（名册没有时百科会补），不是名册原始字段
    const dated = rows.filter((r, i) => { const l = lifeOf(id, i + 1); return l.birth != null || l.death != null; }).length;
    const buried = rows.filter(r => r.burial != null).length;
    return {
      n: rows.length,
      life: dated ? dated + '/' + rows.length + ' 主有生卒年，' + tail
        : rows.length + ' 主，生卒年均无载（' + tail + '）',
      lifeFrom: '生卒年与出处逐主写在' + sec,
      // 一个葬年都没有时不给指针：说"见下"而下面没有葬年，就是承诺了一件没做的事
      burial: buried ? buried + '/' + rows.length + ' 主各有葬年，' + tail : null,
      burialFrom: '葬年与出处逐主写在' + sec
    };
  }

  // 两点相距不足 50 米时 toFixed(1) 会打成「0.0 km」，读起来就是「同一处」——
  // 清孝陵/孝东陵 真的只隔 46 米，汉恭陵/汉宪陵 则是 Wikidata 给两个实体挂了同一个 P625。
  const MIN_RESOLVABLE_KM = 0.05;
  /** 距离显示串的唯一来源：null 档画「不可比」而不是留白，空白会被读成"我们没填"。 */
  function kmTextOf(km) { return (km == null ? '不可比' : km === '<0.1' ? '<0.1 km' : km + ' km'); }

  /**
   * 两座陵之间的直线距离（WGS-84 大圆，PRD §6.3）。邻居列表与对比卡共用这一份，
   * 因为"什么时候不给数字"是三件事：一端无坐标、一端只有市级质心、近到低于源精度。
   * 只给 {km,text,note} 与排序键 _d；_d 仅在保证可比时存在。
   */
  function pairDistance(a, b) {
    if (!a || !b || a.lat == null || b.lat == null) {
      return { km: null, text: kmTextOf(null), note: '有一方无可上图坐标，谈不上直线距离', _d: null };
    }
    if (a.approx_pin || b.approx_pin) {
      return { km: null, text: kmTextOf(null), _d: null,
        note: (a.approx_pin && b.approx_pin ? '两方都只有市级质心' : '一方只有市级质心') + '，直线距离不可比' };
    }
    const d = geo.haversineKm(a.lat, a.lng, b.lat, b.lng);
    if (d < MIN_RESOLVABLE_KM) {
      return { km: '<0.1', text: kmTextOf('<0.1'), _d: d,
        note: '不足 0.1 km，已低于源坐标可分辨的精度，不代表两陵同点' };
    }
    const km = d < 10 ? d.toFixed(1) : String(Math.round(d));
    return { km, text: kmTextOf(km), _d: d, note: null };
  }

  /**
   * 帝陵 → 星图节点（**年份**出口）。只有双源互证连上的那批有；返回 null 表示
   * 这座陵没有可挂的 CBDB 年份，页面据此标「⚠️ 暂未获取」，不是"跳过去看看有没有"。
   * 要决定"给不给星图入口"请用 starJump——那是另一条判据（身份唯一即可）。
   */
  function starOf(id) {
    const l = LINK[id];
    return l ? { emperorId: l.emperor_id, emperor: l.emperor, cbdbId: l.cbdb_id } : null;
  }
  /**
   * 帝陵 → 星图节点（**导航**出口）：这座陵的主人认得准，就能跳去看他的关系图。
   * 详情页那个选项卡与地图卡片的「去星图」只认这一条，不认年份——所以清世宗、辽太祖
   * 这些 CBDB 没有卒年的皇帝，卡片上仍是「暂未获取」，星图却照样进得去。
   */
  function starJump(id) {
    const j = JUMPS[id];
    // 只回 id：节点的名字在 star_map_data.json 里，产物不抄第二份（抄了就是包里的重复字节）
    return j ? { emperorId: j.node, cbdbId: j.cbdb_id || null, via: j.via } : null;
  }
  /** 星图节点 → 帝陵 id：先查导航反查表，再退回年份表——扩权只向外，不许把已有入口改没 */
  function tombOf(emperorId) {
    return BACK[emperorId] || REVERSE.get(emperorId) || null;
  }

  /**
   * CBDB 原始生平行的唯一出口。bioRows() 是给详情页拼措辞用的，对比卡要的是原值
   * （生卒、即位年、在位区间两段年份），所以另开这个口子——但口子只有这一个：
   * 页面与 compare.js 都不许自己去 require emperor_bio.js，否则"谁算连上"就会有两套。
   */
  function bioRaw(id) { return BIO[id] || null; }

  /**
   * 生卒年一句。星图侧的既有写法是「生–卒」带纪元，这里沿用，不另算享年（虚/实岁无源）。
   * 认的是生平连接表（第一轮 + 第二轮别名池），不是星图连接表——第二轮那 36 位
   * 没有星图节点，但仍该有生卒年可看，所以 emperor_id 允许为 null。
   */
  function lifespanOf(id) {
    // 多主陵不合并成一个生卒年：年份各自落在人身上，由「陵主」一节逐主给
    const seq = (LORDS[id] || []).length === 1 ? 1 : null;
    const lf = lifeOf(id, seq);
    const b = BIO[id];
    if (lf.birth == null && lf.death == null) return null;
    const star = LINK[id] || {};
    const w = lf.w || {};
    const diffN = lf.diff
      ? Math.max(Math.abs((lf.diff.birth || 0) - (lf.birth || 0)), Math.abs((lf.diff.death || 0) - (lf.death || 0)))
      : 0;
    return {
      text: (fmtYear(lf.birth) || '?') + '–' + (fmtYear(lf.death) || '?'),
      emperor: (b && b.ch_name) || w.lord || star.emperor || null,
      emperor_id: star.emperor_id || null, cbdb_id: b && b.cbdb_id,
      // 短标签给地图卡片用（长串给详情页）；同样只在这一处生成
      short: lf.fromWiki ? '中文维基百科' : b && b.life_src === 'user_csv' ? '用户提供表' : 'CBDB',
      wikiFilled: lf.fromWiki,
      // 出处必须跟着数字走：这三个值可能来自用户提供的表、CBDB，或由百科补上空格，不是考录文档
      source: [
        b ? lifeProvenance(b).src : '',
        lf.fromWiki ? '这一格用户两份表与人物记录里都没有，按 2026-09-16 指令由百科补：' + wikiCite(w) : '',
        lf.diff ? '百科作 ' + [fmtYear(lf.diff.birth), fmtYear(lf.diff.death)].filter(Boolean).join('–')
          + '，与名册差 ' + diffN + ' 年，按优先级不采用' : '',
        lf.amb || '',
        b ? '葬年核对自《中国历代皇帝陵信息整理》'
          + (b.burial_delta === 0 ? '，两者同年'
            : b.burial_delta == null ? '，考录无葬年可核' : '，相差 ' + Math.abs(b.burial_delta) + ' 年') : ''
      ].filter(Boolean).join('；')
    };
  }

  const DYN_CHAR = /[秦汉魏晋宋齐梁陈隋唐辽金夏元明清]/;
  // PRD §7.2 只给了 10 个示例色；其余按同一色系家族补齐。颜色是设计选择，不是事实数据，
  // 且从不单独承担区分职责——徽章里始终带朝代首字（§7.2 无障碍补充）。
  const COLOR = {
    qin: '#3B3B3B', 'western-han': '#C0392B', 'eastern-han': '#E07A5F',
    'three-kingdoms-wei': '#8E7CC3', 'three-kingdoms-shu': '#A98BD3', 'three-kingdoms-wu': '#7C6BB0',
    'northern-wei': '#4A7C8C', 'eastern-wei': '#5B8A99', 'western-wei': '#3F6E7D',
    'northern-qi': '#6FA8B8', 'northern-zhou': '#3E6B70', 'liu-song': '#5E8C6C',
    'southern-qi': '#74A57E', 'southern-liang': '#8FBF97', chen: '#A9D3B0',
    sui: '#B8860B', tang: '#D4A017',
    'western-jin': '#6B8E9E', 'eastern-jin': '#85A9B8', 'northern-song': '#6B8E9E',
    'southern-song': '#8FB0BE', liao: '#8C5B5B', jin: '#B07A4F', 'western-xia': '#9C6B4A',
    yuan: '#5D7A8C', 'five-dynasties': '#9B7BA0', 'later-jin': '#A98BB0', 'later-zhou': '#8E7CC3',
    'later-shu': '#B58FB0', 'former-shu': '#C7A3C1', 'southern-tang': '#B087A6',
    ming: '#B22222', qing: '#E8B923', legendary: '#8A8A8A', uncertain: '#6f7b8d', modern: '#4F8C7A'
  };
  const FALLBACK = '#8A8A8A';

  const CERTAINTY_LABEL = {
    confirmed: '已确认', disputed: '学术争议', speculated: '位置推测'
  };
  const TYPE_LABEL = { actual: '实葬陵寝', suspected: '存疑陵址', cenotaph: '纪念性陵寝' };

  // PRD F-01-3 的判据半径。列表与地图上的范围圈必须用同一个值，
  // 否则圈和邻居会各自长成一个数字，读者第一个发现的就是对不上。
  const NEIGHBOR_RADIUS_KM = 100;
  // F-04-3 的档位（PRD 原文就是这四个值）。默认仍是 100。
  const NEIGHBOR_RADIUS_OPTIONS = [50, 100, 200, 300];
  const normRadius = km => (NEIGHBOR_RADIUS_OPTIONS.indexOf(Number(km)) >= 0
    ? Number(km) : NEIGHBOR_RADIUS_KM);
  // 提到半径的界面文案一律从这三个函数出：地图卡片、详情页、浏览器镜像以前各写一遍
  // 「100 km」，半径一改就会留下过期数字。措辞本身是外壳，所以住在 i18n 字典里；
  // 默认 zh，页面切语言时带上 lang 重算。字典在调用时取：镜像里 tombs.js 先于 i18n.js 加载。
  const I18N_AT = () => (typeof require === 'function'
    ? require('./i18n.js')
    : (typeof self !== 'undefined' ? self.I18N : null));
  const nbLine = (key, km, lang) => {
    const I = I18N_AT();
    return I ? I.fmt(I.ui(lang)[key], { km: normRadius(km) }) : `{${key}}`;
  };
  const nbHeading = (km, lang) => nbLine('nbHeadingKm', km, lang);
  const nbCta = (km, lang) => nbLine('nbCtaKm', km, lang);
  const nbEmpty = (km, lang) => nbLine('nbEmptyKm', km, lang);

  // F-01-6 缺的那一维：开放状态。四档取自考录文档的 access_tier，
  // 实测与 open_to_public 零矛盾（scenic 53／free_field 32／unreachable 90／无记载 43）。
  // 「是否发掘」这一维**不做筛选**：该列同一句里常同时出现「地宫未发掘」与「陪葬坑已发掘」，
  // 任何二值化都会误判（秦始皇陵、汉长陵、唐靖陵都是反例），要做得逐行人工归类。
  const ACCESS_TIERS = [
    { key: '', label: '全部开放状态' },
    { key: 'scenic', label: '景区开放' },
    { key: 'free_field', label: '野外文保·可前往' },
    { key: 'unreachable', label: '实际不可达' }
  ];
  const accessTierOf = m => (m && m.doc && m.doc.access_tier) || 'none';

  // 图例里的底图出处句。两个实现各自渲染同一个字符串——分两处写必然漂移，
  // 所以两端不一致的地方（浏览器预览没有瓦片）也写进这一句，而不是另起一句。
  const GEO_LEGEND = '底图：省、市、县级界线与地名全部由地图官方底图提供，本项目不画任何自绘界线。'
    + '国界断续段线亦不自绘：官方已自带，自绘那份未经 GCJ-02 偏移，只会在同一片海重影错位。'
    + '（曾叠过一层阿里云 DataV.GeoAtlas 市界抽稀「对照线」，实测真实边界到它的中位偏差约 20 公里，'
    + '2026-09-14 已撤除，不再有开关。）浏览器预览没有瓦片，另画一层省界仅供认形，不作为位置判读依据。';

  // 给 3 座而不是 1 座：用户点的是所在县市的中点，西安市内两汉诸陵彼此 10–30 km，
  // 中点与真实位置差几十公里是常态——这种情况下"最近 1 座"会选错（规格 §9）。
  const NEARBY_LIMIT = 3;
  const PLACE_PICK_NOTE = '这里存的是你自己选报的县市，不是设备定位；'
    + '位置按所选县市的中点估算，选到能选的最细一级即可。';

  function badgeChar(state) {
    const s = String(state || '');
    for (let i = s.length - 1; i >= 0; i--) if (DYN_CHAR.test(s[i])) return s[i];
    return s[0] || '?';
  }

  function decorate(m) {
    return {
      ...m,
      badge: badgeChar(m.state),
      color: COLOR[m.dynasty_code] || FALLBACK,
      // 分档：exact=本体坐标实心圆，exact-doubtful=存疑描边。只有市级质心的记录不参与渲染（见 pinnable）
      renderClass: m.certainty === 'confirmed' ? 'exact' : 'exact-doubtful',
      // 「区域估算点」判据的唯一出处：既要真是用户估的坐标，也要真的会上图
      // （estimated 档里有一批 lat=null 的行，它们无坐标、不是估算点）。
      // 页面与计数都从这里取，谁都不许自己再拼一遍这个条件。
      areaEstimate: m.lat != null && !m.approx_pin
        && m.coord_source === 'user:provided' && m.coord_precision === 'estimated',
      certaintyLabel: CERTAINTY_LABEL[m.certainty] || m.certainty,
      typeLabel: TYPE_LABEL[m.type] || m.type,
      place: [m.province, m.city, m.county].filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i).join(' ')
    };
  }

  function createTombs(data) {
    const all = data.mausoleums.map(decorate);
    const byId = new Map(all.map(m => [m.id, m]));
    // 上图判据（2026-09-15 收紧）：只有**本体坐标**才画点。
    // 市级质心那一档（approx_pin）落在市政府驻地方向，只支撑「在这座市」，
    // 把它画成一颗帝陵图钉就是在用图形宣布一个数据并不支持的定位精度——
    // PRD F-01-1 的原话是「按真实经纬度标注」，质心不是陵的真实经纬度。
    // 这批记录仍然全量进列表／时间轴／搜索／详情，只是不占底图。
    const pinnable = all.filter(m => m.lat != null && !m.approx_pin);
    const offMap = all.filter(m => m.lat != null && m.approx_pin);
    const unpinned = all.filter(m => m.lat == null);
    // 图上一个点都不画的那批。它们必须有入口可达，否则「不画近似点」就变成了「藏掉 71 座陵」
    const notOnMap = offMap.concat(unpinned);

    // 按市聚类：(province, city) 归组，只有会上图的点才参与成泡
    const cityMap = new Map();
    for (const m of pinnable) {
      const key = `${m.province || ''}|${m.city || m.id}`;
      if (!cityMap.has(key)) {
        cityMap.set(key, { key, province: m.province, city: m.city, lat: m.lat, lng: m.lng, ids: [] });
      }
      const c = cityMap.get(key);
      c.ids.push(m.id);
      // 聚合气泡用该市坐标的几何中心，比市质心更靠近实际分布
      if (!c._acc) c._acc = { lat: 0, lng: 0, n: 0 };
      c._acc.lat += m.lat; c._acc.lng += m.lng; c._acc.n++;
    }
    const cities = [...cityMap.values()].map(c => ({
      key: c.key, province: c.province, city: c.city, count: c.ids.length, ids: c.ids,
      lat: c._acc.lat / c._acc.n, lng: c._acc.lng / c._acc.n
    })).sort((a, b) => b.count - a.count);

    function applyFilters(opts = {}) {
      const { forgottenOnly, doubtfulOnly, forgottenStrong } = opts;
      const accessTier = opts.accessTier == null ? '' : opts.accessTier;
      const dyn = opts.dynasty == null ? []
        : (Array.isArray(opts.dynasty) ? opts.dynasty : [opts.dynasty]);
      return pinnable.filter(m =>
        (!dyn.length || dyn.includes(m.dynasty_code))
        && (!forgottenOnly || m.forgotten_flag)
        && (!forgottenStrong || (m.forgotten_flag && forgottenTier(m).strong))
        && (!doubtfulOnly || m.certainty !== 'confirmed')
        && (!accessTier || accessTierOf(m) === accessTier));
    }

    /**
     * 图元分档（PRD F-01-1 + F-01-5 + §9.2）：
     *  - 有本体坐标 → 一座一个图钉，圆形、朝代色、徽章为朝代首字；
     *  - 只有市级质心 → 不画点（见 pinnable 那条判据）；
     *  - opts.cluster（低缩放层级）→ 按市合并成聚类气泡。
     */
    function tombPins(opts = {}) {
      return applyFilters(opts).map(m => ({
        kind: 'tomb', key: m.id, lat: m._g.lat, lng: m._g.lng, label: m.badge,
        color: m.color, renderClass: m.renderClass, certainty: m.certainty,
        name: m.name_cn, tombIds: [m.id]
      }));
    }

    function clusters(opts = {}) {
      const picked = new Set(applyFilters(opts).map(m => m.id));
      return cities.map(c => {
        const items = c.ids.filter(i => picked.has(i)).map(i => byId.get(i));
        if (!items.length) return null;
        const n = items.length;
        return {
          kind: 'cluster', key: c.key, city: c.city || c.province || '',
          lat: items.reduce((s, m) => s + m._g.lat, 0) / n,
          lng: items.reduce((s, m) => s + m._g.lng, 0) / n,
          label: (c.city || c.province || '') + ' ' + n,
          count: n, color: '#B08A4F',
          tombIds: items.map(m => m.id)
        };
      }).filter(Boolean);
    }

    function pins(opts = {}) {
      return opts.cluster ? clusters(opts) : tombPins(opts);
    }

    function summary(m) {
      const life = lifespanOf(m.id);
      return {
        title: m.name_cn,
        emperor: m.emperor_note || '⚠️ 暂未获取',
        dynasty: m.state || '⚠️ 暂未获取',
        // 生卒年属于 Emperor 实体：只有双源自洽连接上的 67 座拿得出来，
        // 其余按 PRD §9.1 标未获取而非留空，更不做"名字最像"的兜底。
        lifespan: life ? life.text : '⚠️ 暂未获取',
        lifeSource: life ? life.source : '', lifeSourceShort: life ? life.short : '',
        burial: (m.doc && m.doc.burial_year) || '⚠️ 暂未获取',
        place: m.place || '⚠️ 暂未获取',
        certainty: m.certaintyLabel,
        type: m.typeLabel,
        excavation: m.doc && m.doc.excavation ? m.doc.excavation : '⚠️ 暂未获取',
        access: m.doc && m.doc.access ? m.doc.access : '⚠️ 暂未获取',
        accessTier: (m.doc && m.doc.access_tier) || 'unknown',
        approx: m.approx_pin,
        forgotten: !!m.forgotten_flag,
        summary: m.summary || '',
        sources: m.sources || [],
        links: (m.doc && m.doc.links) || []
      };
    }

    const MISS = '⚠️ 暂未获取';
    const PRECISION_LABEL = {
      user_supplied: '用户提供的本体坐标',
      verified_exact: '本项目回源核实的本体坐标',
      exact: '数据源给出的本体坐标',
      approximate: '数据源标注为近似位置',
      estimated: '位置估算（推测范围的代表点）',
      admin_centroid: '市级行政质心（无本体坐标，不标点）'
    };
    const ACCESS_TIER_LABEL = {
      scenic: '景区，有门票与服务设施',
      free_field: '野外文保单位，无门票、无服务设施',
      unreachable: '实际不可达',
      unknown: ''
    };
    const FORGOTTEN_LABEL = {
      unexcavated: '未发掘', remote: '地处偏远', restricted_promotion: '传播受限',
      posthumous_elevation: '追尊祖陵，远离本朝陵区主体', attribution_unclear: '墓主归属待核',
      destroyed: '毁弃·沉没·建而复废', unlocated: '位置未定，考录无省市县线索'
    };
    const URL_RE = /https?:\/\/[^\s（）)】\]]+/g;

    /** §9.2 的档位措辞：近似点、推测、争议、纪念性各自要说清「这个点代表什么」 */
    function tierNote(m) {
      if (m.lat == null) {
        return '暂无可上图坐标：史无葬所记载或位置未定，只进列表与时间轴、不画点，'
          + '避免把不确定的位置画成确定。';
      }
      if (m.approx_pin) {
        return '无本体坐标：现有的「' + (m.city || m.province || '地名表质心') + '」坐标只是该市行政质心，'
          + '只支撑「在这座市」，不指示陵体本体的位置，因此底图上不画这一点；'
          + '考录给出的县市级文字地址见「地理位置」，本陵仍可在列表与时间轴里查看。';
      }
      if (m.areaEstimate) {
        return '区域估算点：坐标由用户在核查表里按县、乡或陵区估出（该行备注自述为估算／约值，未点明本体检址），'
          + '与本体坐标过同一套校验，但只支撑「在这一带」，不指示陵体本体的位置；'
          + '图上按推测位置处理（虚线描边），文字地址见「地理位置」。';
      }
      if (m.certainty === 'speculated') {
        return '位置推测：本点是推测范围的代表点，不是实测陵位；地图上应以虚线圈表示范围而非精确点。';
      }
      if (m.certainty === 'disputed') return '学术争议：陵址记载存在分歧，本点采用数据源给出的坐标，分歧意见见「考异」。';
      if (m.type === 'cenotaph') return '纪念性陵寝：非实葬，本点为纪念建筑位置。';
      return null;
    }

    function neighborsOf(id, radiusKm = NEIGHBOR_RADIUS_KM) {
      const t = byId.get(id);
      if (!t || t.lat == null) return [];
      return geo.findNeighbors(t, pinnable, radiusKm)
        .map(({ m, distance }) => ({ tomb: byId.get(m.id), distance }));
    }

    /**
     * 能不能拿这座陵当图上的一个点（图钉、邻居圆心、半径圈）。
     * 判据只写这一次：市级质心当圆心的那个圆，画出来的是「这座市」的范围，
     * 不是「这座陵周围 N km」——两端渲染层都只许问这一个函数。
     */
    function mappable(m) { return !!m && m.lat != null && !m.approx_pin; }

    /** 不可上图的陵点开邻居层时的那句解释（两端共用，免得一处说「画了」一处说「没画」） */
    function nbOffMapNote(m) {
      return '本陵没有本体坐标，只有' + ((m && m.city) || '该市') + '的行政质心。'
        + '以下列出的是该质心 ' + NEIGHBOR_RADIUS_KM + ' km 半径内的帝陵；'
        + '圆心、引线与距离数字都不画——那算出来的是市质心到陵的间隔，不是两座陵的间隔。';
    }

    /**
     * 邻居层图上说明。放在这里而不是页面里：小程序与浏览器镜像画的是同一层，
     * 措辞分两处写就会长成两套口径。
     * @param s 渲染层给出的 { drawn, places, tombs, total }
     */
    function neighborNote(s, radiusKm = NEIGHBOR_RADIUS_KM) {
      const head = `圆＝以本点为圆心的 ${radiusKm} km 半径示意，不是陵区范围；`
        + '距离为 WGS-84 大圆直线距离，不是路程。';
      if (!s.total) return head + '该半径内暂无其他有本体坐标的帝陵。';
      const parts = [];
      if (s.drawn < s.places) {
        parts.push(`图上标最近 ${s.drawn} 处（共 ${s.places} 处可比距离，其余仍可在下方列表里点）`);
      } else {
        parts.push(`图上 ${s.drawn} 处已按直线距离标出`);
      }
      if (s.tombs > s.places) parts.push(`同处一域的 ${s.tombs - s.places} 座已并成一枚气泡`);
      return head + parts.join('；') + '。';
    }

    /**
     * 100 km 邻居（PRD F-01-3）。直线距离用 WGS-84 大圆距离算，不是路程。
     * 候选集里的每一座都有本体坐标，所以不给数字只剩一种情形：**本陵自己没有**
     * （pairDistance 见 approx_pin 即返回 null）。两种历史情形里的那一种——邻居是市级
     * 质心、同市两陵算出 0.0——已随「质心不画点」一起消失。
     * 仍然保留的另一种：两点相距不足 50 米时 toFixed(1) 会打成「0.0 km」，读起来就是「同一处」。
     * 清孝陵/孝东陵 是真的隔 46 米；汉恭陵/汉宪陵 则是 Wikidata 给两个不同实体挂了同一个
     * P625（该条已标 disputed）。两者都不该显示成 0，改成「<0.1」并注明低于源精度。
     * 出处见 PRD §9.1：不许把数据撑不住的精度印出来。
     */
    function neighborList(m, radiusKm) {
      if (m.lat == null) return [];
      /**
       * kmText 是距离的唯一显示串，四个渲染点（小程序摘要卡列表、小程序详情页、
       * 镜像摘要条、镜像详情列表）只许渲染它。此前 null 在小程序什么都不画、在镜像画「—」，
       * 而镜像自己两处一个画「—」一个画「同市·距离不可比」。
       * 空白会被读成"数据缺了"，实际说的是"这组源撑不出可比数字"——两件事差得很远。
       */
      const list = neighborsOf(m.id, radiusKm).map(x => {
        const n = x.tomb;
        const pd = pairDistance(m, n);
        return {
          id: n.id, name: n.name_cn, badge: n.badge, color: n.color,
          place: n.place, certainty: n.certaintyLabel,
          km: pd.km, kmText: pd.text, distNote: pd.note,
          _d: pd._d == null ? Infinity : pd._d
        };
      });
      list.sort((a, b) => a._d - b._d || a.name.localeCompare(b.name, 'zh'));
      for (const x of list) delete x._d;   // 内部排序键，不进 setData 载荷
      return list;
    }

    /**
     * 详情页视图模型（PRD §5.2 详情页 + §9.1 缺失口径）。小程序与浏览器镜像共用这一份，
     * 免得两边各写一套措辞后互相矛盾。四字段以《中国历代皇帝陵信息整理》的 doc 层为准，
     * doc 缺项一律渲染「⚠️ 暂未获取」，不留空、不编造。
     */
    function detail(id, opts = {}) {
      const m = typeof id === 'string' ? byId.get(id) : id;
      if (!m) return null;
      const s = summary(m);
      const doc = m.doc || {};
      const tier = ACCESS_TIER_LABEL[doc.access_tier] || '';
      const accessBase = doc.access
        || (m.open_to_public == null ? '' : (m.open_to_public ? '对外开放' : '不对外开放'));
      const access = accessBase && tier ? accessBase + '｜' + tier : (accessBase || tier || MISS);

      const links = [];
      for (const l of doc.links || []) if (l && l.url) links.push({ label: l.label || l.url, url: l.url });
      // 出处字符串里内联的 URL 也要能点：小程序打不开外链，只能复制到剪贴板，所以单独列出来
      for (const src of m.sources || []) {
        for (const u of String(src).match(URL_RE) || []) {
          if (!links.some(x => x.url === u)) links.push({ label: u, url: u });
        }
      }

      const life = lifespanOf(m.id);
      // 「陵主」一节先备好：上面两格在 N>1 时只说"几主有年、去哪儿看"（lordPointer），
      // 年份与出处逐主在这一节给
      const lords = lordRows(m.id);
      // 状态码必须上屏：用户特意把「生年不可考」「史无葬年之载」「传说/归属有争议」「多主陵」
      // 分开，一律塌成「⚠️ 暂未获取」就是把三种不同的事说成同一种。
      const b0 = BIO[m.id];
      const lp = b0 ? lifeProvenance(b0) : { noteText: '' };
      const lifeFile = !b0 || b0.life_src !== 'user_csv' ? 'CBDB（经帝陵↔CBDB 生平连接）'
        : b0.life_file === 'supplement' ? '用户补录表第 ' + b0.csv_line + ' 行'
          : '用户提供《emperors_birth_death.csv》第 ' + b0.csv_line + ' 行';
      const lifeWhy = b0 && b0.life_status === 'unknown_birth' ? '；生年不可考（不硬凑）'
        : b0 && b0.life_status === 'legendary_or_disputed' ? '；传说时代或归属有争议，不填公历纪年'
          : b0 && b0.life_status === 'multi_lord' ? '；多主陵：生卒年按陵主单记，不合并成一个' : '';
      const burialSup = b0 && b0.supplied_burial != null ? bioYear(b0.supplied_burial) : null;
      const burialWhy = b0 && b0.life_status === 'unknown_burial' && b0.death != null
        ? '卒于' + bioYear(b0.death) + '，史无葬年之载（不用卒年冒充）' : null;
      // 备注（两说并存 / 仅暂安 / 归属为推定）跟着值走：有值挂在出处后面，
      // 没值时它和状态码一起就是这一格的解释，而不是光秃秃一个「暂未获取」。
      const noteOnly = lp.noteText.replace(/^；/, '');
      const withNote = s => {
        const t = String(s || '').replace(/^；/, '');
        return t ? t + lp.noteText : (noteOnly || null);
      };
      // 多主陵这两格从今天"整格暂未获取"改成"几个主有年 + 去下一节看"：
      // 用户给的年份从此各自落在人身上，不必再为了不把九主压成一个数而留空。
      const ptr = lordPointer(m.id, '逐主见下', '「陵主」一节');
      const many = !!ptr;
      const lifeV = many ? ptr.life : (life ? life.text : MISS);
      const lifeFrom = many ? ptr.lifeFrom : withNote(life ? lifeFile : lifeWhy);
      const burialV = doc.burial_year || (many ? ptr.burial : burialSup) || MISS;
      const burialFrom = doc.burial_year ? '考录文档'
        : many && ptr.burial ? ptr.burialFrom : withNote(burialSup ? lifeFile : burialWhy);
      return {
        id: m.id, title: m.name_cn, nameEn: m.name_en || '',
        badge: m.badge, color: m.color,
        dynasty: s.dynasty, emperor: s.emperor,
        certainty: s.certainty, type: s.type,
        life, bio: bioRows(m.id), lords,
        forgotten: s.forgotten, approx: !!m.approx_pin, hasCoord: m.lat != null,
        forgottenReasons: (m.forgotten_reason || []).map(r => FORGOTTEN_LABEL[r] || r),
        coBuried: !!m.co_buried, posthumous: !!m.posthumous_elevation,
        fields: [
          { k: '地理位置', v: doc.location || s.place || MISS, from: doc.location ? '考录文档' : null },
          { k: '下葬年份', v: burialV, from: burialFrom },
          // F-03 基础信息的生卒年：来源可能是 CBDB、用户那份皇帝表、或用户的补录表——
          // 出处必须跟着值走，且状态码要在这里说清，不能只留一个「暂未获取」。
          { k: '生卒年', v: lifeV, from: lifeFrom },
          { k: '是否发掘', v: doc.excavation || m.excavation_status || MISS, from: doc.excavation ? '考录文档' : null },
          { k: '是否对外开放', v: access, from: doc.access ? '考录文档' : null }
        ].map(f => Object.assign(f, { missing: String(f.v).indexOf(MISS) >= 0 })),
        visit: m.visit_info || '',
        summary: m.summary || '', notes: m.notes || '',
        location: {
          hasCoord: m.lat != null,
          wgs84: m.lat == null ? MISS : m.lat.toFixed(6) + ', ' + m.lng.toFixed(6),
          gcj02: m.lat == null ? MISS : m._g.lat.toFixed(6) + ', ' + m._g.lng.toFixed(6),
          coordSystem: m.coordinate_system || 'WGS-84',
          // 没有坐标就没有档位可言：辽庆陵这类 coord_precision='estimated' 却 lat=null 的行，
          // 报「位置估算」会让人以为图上有个估算点，其实一个点都没画
          precision: m.lat == null ? MISS : (PRECISION_LABEL[m.coord_precision] || m.coord_precision),
          source: m.coord_source || '',
          cross: !!m.coord_cross_validated,
          tierNote: tierNote(m),
          admin: s.place || MISS
        },
        neighbors: neighborList(m, opts.radiusKm || NEIGHBOR_RADIUS_KM),
        sources: m.sources || [],
        links
      };
    }

    /**
     * 离某个位置点最近的 N 座帝陵（F-01-9，规格 §12）。
     *
     * 坐标系方向是这条链上唯一会静默出错的地方：places 的点与底图同源按 GCJ-02 使用，
     * 而距离必须 WGS-84（PRD §6.3），所以先 gcj02ToWgs84 再 haversineKm，
     * 且帝陵侧只用原始 lat/lng——拿 _g（渲染坐标）算距离是本函数最容易犯的错。
     *
     * 参与集 = 有本体坐标的 127 座。71 座只有市级质心、20 座连坐标都没有，都不参与，
     * 且卡片必须把这两类分别说出来（nearbyNote）：拿市质心排出来的「最近」，
     * 排的其实是市政府驻地离你多近。
     */
    function nearestTo(c, limit = NEARBY_LIMIT) {
      if (!c || !isFinite(c.lat) || !isFinite(c.lng)) return [];
      const w = geo.gcj02ToWgs84(c.lat, c.lng);
      return pinnable
        .map(m => ({
          id: m.id, name: m.name_cn, badge: m.badge, color: m.color, place: m.place,
          km: geo.haversineKm(w.lat, w.lng, m.lat, m.lng),
          tierLabel: m.certaintyLabel
        }))
        .sort((a, b) => a.km - b.km || a.name.localeCompare(b.name, 'zh'))
        .slice(0, limit)
        .map(x => {
          const km = Math.round(x.km * 10) / 10;
          return Object.assign({}, x, { km, kmText: km < 1 ? '<1' : String(Math.round(km)) });
        });
    }

    /** 卡片脚注。两端渲染同一个字符串，理由同 neighborNote。 */
    function nearbyNote(place) {
      const name = (place && place.name) || '所选县市';
      return `按你在${name}的中点估算，直线距离不是路程；`
        + `只有 ${offMap.length} 座仅有市级质心、${unpinned.length} 座完全无坐标，两类都未参与排序。`;
    }

    const dynastyOptions = [...all.reduce((map, m) => {
      const k = m.dynasty_code;
      const cur = map.get(k) || { code: k, label: m.state, count: 0, color: m.color };
      cur.count++; map.set(k, cur); return map;
    }, new Map()).values()].sort((a, b) => b.count - a.count);

    // GCJ-02 预转换：渲染层不再碰坐标系，距离一律用原始 WGS-84
    for (const m of all) m._g = geo.wgs84ToGcj02(m.lat == null ? 0 : m.lat, m.lng == null ? 0 : m.lng);

    /** 聚类气泡的 key → 成员帝陵记录，供点击后展开列表 */
    function membersOf(key) {
      const c = cities.find(x => x.key === key);
      return c ? c.ids.map(i => byId.get(i)) : [];
    }

    // ── 文化图层（PRD F-01-7、F-04-7、§5.2 专题）────────────────────────
    // 硬信号＝可核查的事实；restricted_promotion（传播受限）是明示的定性判断，不计入硬信号，
    // 否则"某个朝代在公众叙事里被跳过"这种主观项就能把一座陵推成"被遗忘"。
    const HARD_SIGNALS = ['remote', 'unexcavated', 'unlocated', 'destroyed',
      'attribution_unclear', 'posthumous_elevation'];
    function forgottenTier(m) {
      const rs = m.forgotten_reason || [];
      const hard = rs.filter(r => HARD_SIGNALS.indexOf(r) >= 0);
      return { hard: hard.length, strong: hard.length >= 2,
        reasons: rs.map(r => FORGOTTEN_LABEL[r] || r) };
    }
    const forgottenCount = all.reduce((tally, m) => {
      if (!m.forgotten_flag) return tally;
      tally.total++; if (forgottenTier(m).strong) tally.strong++; else tally.single++;
      return tally;
    }, { total: 0, strong: 0, single: 0 });

    // 陪葬墓：143 座全有 OSM 精确坐标，可以画；但归属一律只认 parent_hint。
    // 「秦琼墓在礼泉县、礼泉县有昭陵」是推理不是出处，所以那 84 座标「未记所属帝陵」。
    const acc = (data.accompanying_tombs || []).map((a, i) => ({
      key: 'acc:' + i, name: a.name, county: a.county || '', historic: a.historic || '',
      parent: a.parent_hint || '', attached: !!a.parent_hint,
      lat: a.lat, lng: a.lng, source: a.source || '',
      _g: geo.wgs84ToGcj02(a.lat, a.lng)
    }));
    const accStats = {
      total: acc.length, attached: acc.filter(x => x.attached).length,
      parents: acc.filter(x => x.attached).reduce((o, x) => {
        o[x.parent] = (o[x.parent] || 0) + 1; return o;
      }, {})
    };

    // 北魏迁陵叙事：只用名册里有的行，葬年用文档原文不重算（年份解析住在 timeline.js，
    // 在这儿复刻一份就会漂移）。16 行里 8 行连省市都没有，所以这张卡讲的是
    // "数据集能支撑到哪一步"，不是一张迁陵分布图。
    const weiRows = all.filter(m => /北魏/.test(String(m.state) + String(m.dynasty_code)));
    const weiLuoyang = weiRows.filter(m => m.city === '洛阳市');
    const weiDatong = weiRows.filter(m => m.city === '大同市');
    const weiUnplaced = weiRows.filter(m => !m.city && !m.province);
    const weiCentroid = weiRows.filter(m => m.lat != null && m.approx_pin);
    const beiweiStory = {
      total: weiRows.length,
      pinnable: weiRows.filter(m => m.lat != null && !m.approx_pin).length,
      centroid: weiCentroid.length,
      noCoord: weiRows.filter(m => m.lat == null).length,
      luoyang: weiLuoyang.map(m => ({ name: m.name_cn, burial: (m.doc && m.doc.burial_year) || '⚠️ 暂未获取' })),
      datong: weiDatong.map(m => ({ name: m.name_cn, burial: (m.doc && m.doc.burial_year) || '⚠️ 暂未获取' })),
      unplaced: weiUnplaced.map(m => m.name_cn),
      // 句子住在这里：模板各拼一遍就会漂，且数组一空就渲染出 undefined
      line: '北魏迁陵：名册里 ' + weiRows.length + ' 行涉北魏，有本体坐标可上图 '
        + weiRows.filter(m => m.lat != null && !m.approx_pin).length + '、只有市级质心因而不标点 '
        + weiCentroid.length + '、无坐标 ' + weiRows.filter(m => m.lat == null).length + '；洛阳 '
        + weiLuoyang.length + ' 座'
        + (weiLuoyang.length ? '（名册中第一条是' + weiLuoyang[0].name_cn
          + '，葬年记「' + ((weiLuoyang[0].doc && weiLuoyang[0].doc.burial_year) || '—') + '」）' : '')
        + '、大同 ' + weiDatong.length + ' 座，另有 ' + weiUnplaced.length + ' 行连省市都无记载。'
        + '所以这里讲的是"迁陵这件事在数据里还剩多少"，画不出一张迁陵分布图。'
    };

    return {
      meta: data.meta, all, byId, pinnable, offMap, unpinned, notOnMap, cities,
      forgottenTier, forgottenCount, acc, accStats, beiweiStory,
      dynastyOptions, applyFilters, pins, tombPins, clusters, membersOf,
      summary, detail, tierNote, neighborsOf, neighborNote, mappable, nbOffMapNote,
      NEIGHBOR_RADIUS_KM, GEO_LEGEND,
      NEIGHBOR_RADIUS_OPTIONS, normRadius, nbHeading, nbCta, nbEmpty,
      ACCESS_TIERS, accessTierOf,
      lifespanOf, starOf, starJump, tombOf, bioRaw, MISS,
      pairDistance, kmTextOf, fmtYear, BIO_META,
      LINKED: Object.keys(LINK).length, bioRows, BIO_LINKED: Object.keys(BIO).length,
      // 三件事三个数，不许混谈：BIO_LINKED 是"CBDB/用户表连上"的老账（语义不动），
      // WIKI_FILLED 是百科供过值的座数，BIO_SHOWN 是界面上真渲染出「生平与事功」一节的座数
      WIKI_FILLED: Object.keys(WIKI).length,
      BIO_SHOWN: new Set([...Object.keys(BIO), ...Object.keys(WIKI)
        .filter(id => (LORDS[id] || []).length === 1 && !BIO[id])]).size,
      JUMPED: Object.keys(JUMPS).length, BACKS: Object.keys(BACK).length,
      // 陵主侧同一套规矩：出口只有这一个，页面与 search.js 都不许自己 require lords.js
      lordRows, lordsOf, lordPointer, LORDS_META, LORDS_TOMBS: Object.keys(LORDS).length,
      nearestTo, nearbyNote, NEARBY_LIMIT, PLACE_PICK_NOTE,
      counts: {
        total: all.length, pinnable: pinnable.length,
        // 上图的两档之分：pinnable 里有多少枚只是区域估算点，其余才是本体坐标。
        // 少了这一格，任何「逐座上图 N」的转述都会把估算点说成本体坐标。
        areaEstimate: pinnable.filter(m => m.areaEstimate).length,
        // 与 areaEstimate 互补：剩下的那部分才配叫「有本体坐标」。
        // 模板里不许自己减，减错了没人发现——所以这里两个都给。
        bodyCoord: pinnable.filter(m => !m.areaEstimate).length,
        offMap: offMap.length,
        unpinned: unpinned.length,
        notOnMap: notOnMap.length,
        accessTiers: ACCESS_TIERS.slice(1).reduce((acc, o) => {
          acc[o.key] = pinnable.filter(m => accessTierOf(m) === o.key).length; return acc;
        }, {})
      },
    };
  }

  return createTombs;
}));
