// 界面语言字典（PRD §4.7 F-07-4 双语切换）。UMD，小程序与镜像共用一份。
//
// 边界写在这里，别靠默契：
//  - **本字典覆盖"外壳"**：导航、按钮、开关、小节标题、行名、占位符、图例与提示句 —— 这些是我们自己写的话，可以译。
//  - **数据与 utils 生成的句子不译**（朝代名、陵名、省市县、考录四字段值、CBDB 引据与原文 Notes、
//    GEO_LEGEND／AXIS_NOTE／半径档位句等）。它们的措辞贴着来源与口径走
//    （例："未正式发掘"≠"未发掘"，"市级近似"指质心），翻成第二语言就是在制造第二套口径，
//    违反 PRD §9.1。EN 模式下界面顶部常驻这一条说明。
//  - 一句中文该不该进字典，只看它在说什么：**说"这里能点什么／这一行叫什么"的是外壳，要译**；
//    **说"数据里有多少、落在哪一档、按哪个坐标系算"的是数据陈述，不译**（同类：图上标签的原形，
//    例如图例里那枚「洛阳市 13·近似」，它就是屏幕上真实画出来的字）。
//  - 不译的都必须登记进 `check_i18n.js` §5 的豁免表并写明理由，漏登记即失败；
//    豁免条目没被命中同样失败——否则表会长成没人敢删的旧账。
//  - utils 里必须由 JS 拼出来的外壳串（nbCta／nbHeading）带 lang 参数，默认 zh；
//    页面切语言时要重算那几个 data 字段。能在模板里用 ui 键 + 量词拼开的，一律优先这么写：
//    预拼好的串会在切换语言后留在 data 里变成过期文案。
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.I18N = api;
}(typeof self !== 'undefined' ? self : this, function () {
  const LANGS = [{ key: 'zh', label: '中文' }, { key: 'en', label: 'English' }];
  const DEFAULT_LANG = 'zh';

  const zh = {
    langNotice: '界面外壳已切英文；数据值与出处、方法说明仍为中文——它们贴着来源口径，翻译会造出第二套口径。',
    // 通用
    reset: '重置', back: '返回', close: '收起', detail: '详情', copy: '复制链接',
    approxShort: '不在图上·仅市级质心', noCoordShort: '无坐标', forgotten: '被遗忘', radius: '半径',
    // 地图页
    onlyDoubtful: '仅存疑',
    toolSearch: '搜索', toolTimeline: '时间轴', toolStar: '星图', toolNearby: '附近', toolLegend: '图例',
    legendClose: '收起图例', toolUnpinned: '未上图',
    swapPlace: '换位置', pickThisLevel: '就选这一级',
    nearbyTitle: '离这里最近的帝陵', nearbyPickHint: '选择你所在的县市（不申请定位权限）',
    searchPh: '陵名／皇帝／朝代／地名',
    legendBadge: '单字圆徽＝一座有本体坐标的帝陵，底色为朝代色，字为朝代首字',
    legendRing: '橙色描边＝陵址存疑（学术争议／位置推测）',
    legendCluster: '缩放过小时按市聚类；底色为土黄色',
    legendAcc: '「陪·名」胶囊＝陪葬墓。它不是帝陵，不计入下方计数。',
    legendAux: '底色与描边只是辅助，档位一律在卡片里用文字再说明一次。',
    disclaimer: '示意图，非标准地图，不作测绘依据',
    cardFull: '查看详情与出处',
    cardFoot: '卡片只给摘要；四字段全文、坐标与档位、可复制出处都在详情页。',
    nbBubble: '气泡里只写距离数字，点气泡即切到那座陵。',
    accBelong: '归属', accCoord: '坐标', accSource: '出处',
    accNotTomb: '陪葬墓不是帝陵：不计入帝陵计数，也不参与半径内邻居与检索所用的帝陵名册。',
    forgottenLayer: '被遗忘的帝陵（顶栏「被遗忘」开关可只看这一档）',
    // 详情页
    nfTitle: '找不到这座帝陵', nfBody: '它可能不在名册里，或链接参数丢了。返回地图重新点选即可。',
    secBioPlain: '生平与事功',
    bioNone: '本座未连上 CBDB 生平表（三轮连接都没唯一命中：星图同名节点、帝王别名池、折繁简整名，'
      + '且未通过葬年与卒年互证；用户提供的那两份表里也没有它），因此不生成生平内容——'
      + '叙述性文字若靠模型记忆补写，正违反需求 §9.1。',
    bioCBDB: 'CBDB 原文：',
    secFields: '考录四字段', visit: '参观信息', secWhere: '具体位置',
    secLords: '陵主', unitLords: '位',
    lordsHint: '一陵多主的陵，生卒年与葬年逐主各记各的（用户 2026-09-15 指定「拆成逐个陵主」）；'
      + '年份用短写法，「前」表示公元前。标「归属推定」的是源自己就说这一主归到哪座陵尚未定论'
      + '（西夏陵、北京金代皇陵那类），不是我们没查。',
    admin: '行政归属', coordTier: '坐标档位', secOwner: '墓主与考异',
    coBuried: '合葬', yes: '是', posthumous: '追尊',
    posthumousBody: '本陵为后代追尊所建，墓主生前未称帝',
    secWhyForgotten: '为什么算「被遗忘」',
    whyForgottenHint: '「被遗忘」是本项目按 PRD §5.2 判据做的定性判断，每条都必须带至少一个理由码，不靠模型印象。',
    secNeighbors: '半径内的帝陵', nbEmpty: '该半径内暂无其他有坐标的帝陵。',
    // 带半径数字的三条：由 utils/tombs.js 现拼，所以措辞也住在字典里，页面不许另抄一份
    nbHeadingKm: '{km} km 内的帝陵', nbCtaKm: '查看 {km} km 内的帝陵',
    nbEmptyKm: '{km} km 范围内暂无其他有坐标的帝陵。',
    nbHint: '直线距离为 WGS-84 大圆距离，不是路程；有一方只到市级行政质心时不给数字，'
      + '因为那算出来的是质心与陵的间隔，不是两座陵的距离。不足 0.1 km 的只标「<0.1」——已低于源坐标可分辨的精度，不代表两陵同点。',
    copyHint: '小程序不能直接打开站外链接，点一下把网址复制到剪贴板，再到浏览器里查看原始出处。',
    footNote: '示意图，非标准地图，不作测绘依据。坐标仅用于文化导览定位，精度以「坐标档位」一栏为准。',
    expandNb: '展开全部',
    // 时间轴页
    tabMap: '地图', tabTimeline: '时间轴', tabStar: '星图',
    starCta: '在人物星图里查看此人的关系网', starBackCta: '在地图上定位这座帝陵',
    tlCount: '在轴', tlDated: '定年', tlPending: '待核',
    tlChipTail: '个朝代 ← 左右滑动', tlAllDynasties: '共',
    tlAxisNote: '轴上时间＝下葬年',
    tlLegendBand: '色条＝朝代，与徽章首字同源（颜色不单独表意）',
    tlLegendBce: '公元前年份，与公元连续排序（全轴无 0 年）',
    tlLegendReloc: '该年是迁葬而非初葬',
    tlPendTail: '座（按朝代聚在一起，不编年份）',
    // F-02-5 区间框选
    tlRange: '区间', tlRangePh: '如 386 或 前386', tlRangeApply: '只看这段', tlRangeClear: '清掉区间',
    // 文化图层
    accLayer: '陪葬墓', strongTier: '被遗忘·强',
    tierPrefix: '开放档',
    // F-07-1 皇帝对比卡（只放外壳词；表头与"为什么空着"的说明由 utils/compare.js 给，按双语边界不译）
    tabCompare: '对比', comparePageTitle: '皇帝对比卡', compareAdd: '加入对比',
    compareChosen: '已选', compareCells: '逐项对照', compareDist: '两两直线距离',
    compareRemove: '移出', compareClear: '清空', comparePick: '挑一位加入', compareGo: '去对比卡',
    compareEmpty: '还没选人。在地图卡片或详情页点「加入对比」，或用下面的检索挑人。',
    // 通用量词与前缀：中英词序不同，所以只在句子里占位，不拼进数据串
    unitTomb: '座', unitTiao: '条', unitPerson: '人',
    bceMark: '前', view: '查看', hitPrefix: '命中',
    // 详情页标签
    forgottenTag: '被遗忘的帝陵', noCoordTag: '暂无可上图坐标', approxPinTag: '只有市级质心·不上图',
    rowCoord: '坐标', secSources: '出处',
    // 地图页：卡片行名与图层级按钮
    rowDynasty: '朝代', rowTomb: '帝陵', rowLife: '生卒', rowPlace: '位置',
    rowType: '性质', rowBurial: '下葬', rowAccess: '开放',
    rowLayer: '图层', nb: '邻居', collapseNb: '收起邻居',
    pickTitle: '你所在的县市',
    // 时间轴补句
    tlTailA: '此后', tlTailB: '座无可靠下葬年 ↓',
    tlRelocTotal: '共',
    tlLegendDotA: '只有市级质心坐标（不上图）', tlLegendDotB: '无坐标，只在此页出现',
    // 星图页
    starSearchPh: '搜索皇帝姓名、字号或朝代',
    starDepth: '世代', starDepthUnit: '代',
    starCanvasHint: '拖拽移动 · 双指缩放 · 点击节点',
    starLegendRelation: '关系', starLegendLine: '线型＝来源',
    starDirectRel: '直接关联', starGraphShow: '星图显示', starViewTotal: '共',
    starNoOthersA: '当前', starNoOthersB: '代范围内没有其他皇帝，可提高世代数',
    starLineage: '世系链', starRelations: '关联人物', starNoRelations: '当前筛选下暂无关联',
    starEmperorList: '皇帝列表',
    notLinked: '未连星图'
  };

  const en = {
    langNotice: 'Interface chrome is in English. Data values, citations and method notes stay in Chinese: '
      + 'their wording follows the sources, and translating them would create a second set of definitions.',
    reset: 'Reset', back: 'Back', close: 'Close', detail: 'Details', copy: 'Copy link',
    approxShort: 'off map · centroid only', noCoordShort: 'no coords', forgotten: 'Forgotten', radius: 'Radius',
    onlyDoubtful: 'Uncertain only',
    toolSearch: 'Search', toolTimeline: 'Timeline', toolStar: 'Kinship', toolNearby: 'Nearby', toolLegend: 'Legend',
    legendClose: 'Hide legend', toolUnpinned: 'Unmapped',
    swapPlace: 'Change', pickThisLevel: 'Choose this',
    nearbyTitle: 'Nearest mausoleums', nearbyPickHint: 'Pick your county/city — no location permission is requested',
    searchPh: 'mausoleum, emperor, dynasty or place',
    legendBadge: 'Round badge = a mausoleum with its own coordinates; colour is the dynasty, glyph its initial',
    legendRing: 'Orange ring = disputed or speculative location',
    legendCluster: 'At low zoom, pins cluster by city (earth-gold background)',
    legendAcc: '“陪·name” capsule = accompanying tomb. Not an imperial mausoleum; excluded from the counts below.',
    legendAux: 'Colour and stroke are secondary aids; every precision tier is restated in words on the card.',
    disclaimer: 'Schematic map, not a standard map, not for surveying',
    cardFull: 'Full record and sources',
    cardFoot: 'Summary card only; the four sourced fields, coordinates and copyable citations are on the detail page.',
    nbBubble: 'Bubbles carry distances only; tap one to switch mausoleum.',
    accBelong: 'Attribution', accCoord: 'Coordinates', accSource: 'Source',
    accNotTomb: 'Accompanying tombs are not imperial mausoleums: excluded from the counts, the neighbour radius and search.',
    forgottenLayer: 'Forgotten mausoleum (use the “Forgotten” toggle to see only these)',
    nfTitle: 'Mausoleum not found', nfBody: 'It may be absent from the roster, or the link lost its parameter. Go back and pick again.',
    secBioPlain: 'Life and deeds',
    bioNone: 'This mausoleum is not linked to the CBDB biography table (none of the three passes produced a '
      + 'unique, year-corroborated match, and it is not in either table the user supplied either), so no '
      + 'biography is generated — writing one from model memory would breach §9.1. '
      + 'Biography coverage is wider than kinship-graph coverage: the two sets are not the same size.',
    bioCBDB: 'CBDB original text: ',
    secFields: 'Four sourced fields', visit: 'Visiting', secWhere: 'Location',
    secLords: 'Tomb occupants', unitLords: 'occupant(s)',
    lordsHint: 'Where several occupants share a mausoleum, birth/death and burial years are recorded one row '
      + 'each (per the user instruction of 2026-09-15 to split every multi-occupant tomb). Years use the short '
      + 'form, “前” marking BCE. “归属推定” flags rows whose own source says the attribution is still disputed '
      + '(Western Xia, the Jin imperial cemetery) — not a lookup we skipped.',
    admin: 'Administration', coordTier: 'Coordinate tier', secOwner: 'Occupant and doubts',
    coBuried: 'Co-buried', yes: 'Yes', posthumous: 'Posthumous',
    posthumousBody: 'Raised by descendants; the occupant never reigned',
    secWhyForgotten: 'Why this counts as forgotten',
    whyForgottenHint: 'A qualitative judgement made against the rubric in PRD §5.2; every flagged row carries at least one reason code, never a model impression.',
    secNeighbors: 'Mausoleums within the radius', nbEmpty: 'No other mausoleum with coordinates inside this radius.',
    nbHeadingKm: 'Mausoleums within {km} km', nbCtaKm: 'Show mausoleums within {km} km',
    nbEmptyKm: 'No other mausoleum with coordinates within {km} km.',
    nbHint: 'Distances are WGS-84 great-circle lines, not routes. No number is given when either side has only a city centroid, '
      + 'because that would be the distance between two city centres rather than between two mausoleums. '
      + 'Below 0.1 km it reads “<0.1” — finer than the source coordinates can resolve, not a claim that they are the same spot.',
    copyHint: 'A mini program cannot open external links, so this copies the URL to the clipboard for your browser.',
    footNote: 'Schematic map, not for surveying. Coordinates serve cultural guidance only; trust the “Coordinate tier” row.',
    expandNb: 'Show all',
    tabMap: 'Map', tabTimeline: 'Timeline', tabStar: 'Kinship',
    starCta: 'View this person’s network in the kinship graph',
    starBackCta: 'Locate this mausoleum on the map',
    tlCount: 'on axis', tlDated: 'dated', tlPending: 'to verify',
    tlChipTail: 'dynasties ← scroll sideways', tlAllDynasties: 'Total',
    tlAxisNote: 'Axis time = burial year',
    tlLegendBand: 'Colour bar = dynasty, same source as the badge glyph (colour is never the only cue)',
    tlLegendBce: 'BCE years, ordered continuously with CE (no year 0 on the axis)',
    tlLegendReloc: 'this year is a reburial, not the original interment',
    tlPendTail: 'rows (grouped by dynasty; no year is invented)',
    tlRange: 'Range', tlRangePh: 'e.g. 386, or 「前386」 for BCE',
    tlRangeApply: 'Apply', tlRangeClear: 'Clear range',
    accLayer: 'Accompanying', strongTier: 'Forgotten · strong',
    tierPrefix: 'Access',
    tabCompare: 'Compare', comparePageTitle: 'Emperor comparison', compareAdd: 'Add to compare',
    compareChosen: 'Selected', compareCells: 'Field by field', compareDist: 'Straight-line distances',
    compareRemove: 'Remove', compareClear: 'Clear', comparePick: 'Add another', compareGo: 'Open comparison',
    compareEmpty: 'Nothing selected yet. Tap “Add to compare” on a map card or a detail page, '
      + 'or pick someone with the search below.',
    unitTomb: 'tombs', unitTiao: 'entries', unitPerson: 'people',
    bceMark: 'BC ', view: 'View', hitPrefix: 'Match: ',
    forgottenTag: 'Forgotten mausoleum', noCoordTag: 'No coordinates to plot',
    approxPinTag: 'City centroid only · not plotted',
    rowCoord: 'Coordinates', secSources: 'Sources',
    rowDynasty: 'Dynasty', rowTomb: 'Emperor', rowLife: 'Birth–death', rowPlace: 'Place',
    rowType: 'Type', rowBurial: 'Burial', rowAccess: 'Access',
    rowLayer: 'Layer', nb: 'Neighbours', collapseNb: 'Hide neighbours',
    pickTitle: 'Your county or city',
    tlTailA: 'plus', tlTailB: 'more with no reliable burial year ↓',
    tlRelocTotal: 'in total',
    tlLegendDotA: 'city centroid only (not plotted)', tlLegendDotB: 'no coordinates; appears on this page only',
    starSearchPh: 'Search emperors by name, style or dynasty',
    starDepth: 'Depth', starDepthUnit: 'gen',
    starCanvasHint: 'Drag to pan · pinch to zoom · tap a node',
    starLegendRelation: 'Relation', starLegendLine: 'Line style = source',
    starDirectRel: 'Direct links:', starGraphShow: 'graph shows', starViewTotal: ', total',
    starNoOthersA: 'No other emperor within', starNoOthersB: 'generations — raise the depth',
    starLineage: 'Lineage chain', starRelations: 'Related people',
    starNoRelations: 'No relations under this filter', starEmperorList: 'Emperor list',
    notLinked: 'Not in kinship graph'
  };

  // 字典必须两侧齐全：少一个键就会在切换语言时静默漏出 undefined
  const missing = Object.keys(zh).filter(k => !(k in en)).concat(Object.keys(en).filter(k => !(k in zh)));
  if (missing.length) console.error('i18n 两侧键不一致：' + missing.join(', '));

  const normLang = l => (l === 'en' ? 'en' : DEFAULT_LANG);
  function ui(lang) {
    const l = normLang(lang);
    return Object.assign({}, zh, l === 'en' ? en : {}, { lang: l, langs: LANGS });
  }

  // 只有 JS 侧用得着：WXML 调不了函数，模板里的外壳句一律用 ui 键 + 量词拼开。
  // 取不到的占位原样留在串里——渲染出「{km}」比静默留白更容易被发现。
  const fmt = (tpl, map) => String(tpl).replace(/\{(\w+)\}/g,
    (s, k) => (map && Object.prototype.hasOwnProperty.call(map, k) ? map[k] : s));

  return { LANGS, DEFAULT_LANG, normLang, ui, fmt, keys: Object.keys(zh).length, zh, en };
}));
