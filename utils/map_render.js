// 帝陵地图页的渲染层：把「图元」翻译成微信原生 <map> 能吃的 markers / polygons / polyline。
//
// 为什么要单独抽出这一层：原生 <map> 的字段名与色值格式都很严格（写错键名不会报错，只会静默不画），
// 放进页面里就没法在 Node 侧跑校验。这里全是纯函数，页面只负责 setData。
//
// 原生图钉没有虚线描边、也没有圆点形状，只有「图标 + label 气泡」。所以：
//  - 视觉全部由 1×1 透明图标之上的 label 承担（见 make_transparent_png.js）；
//  - 只有本体坐标的记录会进这一层（判据在 utils/tombs.js 的 mappable），所以这里不存在
//    「近似点」这一档标记；仍要区分的是存疑点——原生图钉画不出虚线，颜色之外必须让文字
//    自己说出性质（PRD §7.2 无障碍补充），图例与卡片再各陈述一次。
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MapRender = api;
}(typeof self !== 'undefined' ? self : this, function () {
  const ICON = '/images/transparent.png';
  const FONT = 12;
  const PAD = 4;
  // 可见经度跨度大于该值时退化为按市聚类。手机 375px 宽下 14° 约等于缩放级别 5.5，
  // 再放宽到桌面镜像用的 24°，127 座本体坐标陵的图钉会挤到相距 20px 以内互相压盖。
  // 官方那份「缩放级别—地图宽度」对照表口径不明（未说明是可视宽度还是比例尺格长），不能用来定阈值。
  const CLUSTER_LON_SPAN = 14;

  // 腾讯/高德瓦片沿用 slippy map 缩放层级：整幅世界在 zoom z 占 256·2^z 像素
  function lonSpanFor(scale, windowWidth) {
    return 360 * windowWidth / (256 * Math.pow(2, scale));
  }
  function shouldCluster(scale, windowWidth) {
    return lonSpanFor(scale, windowWidth) > CLUSTER_LON_SPAN;
  }

  /** 色值必须是 #RRGGBB / #RRGGBBAA，rgba() 在原生组件上不生效 */
  function hex8(hex, alpha) {
    const h = String(hex).replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16);
    return '#' + full.slice(0, 6) + (a.length === 1 ? '0' + a : a);
  }

  /** 底色亮度决定字色：浅色朝代色（清 #E8B923、梁 #A9D3B0）上白字会糊成一片 */
  function inkFor(bg) {
    const h = String(bg).replace('#', '');
    const n = i => parseInt(h.slice(i, i + 2), 16);
    const lum = 0.2126 * n(0) + 0.7152 * n(2) + 0.0722 * n(4);
    return lum > 150 ? '#1A1A1A' : '#FFFFFF';
  }

  function isWide(cp) {
    return (cp >= 0x3400 && cp <= 0x4DBF) || (cp >= 0x4E00 && cp <= 0x9FFF)
      || (cp >= 0x3000 && cp <= 0x303F) || (cp >= 0xFF00 && cp <= 0xFFEF);
  }

  /** 小程序量不到文字宽度，只能按「中日韩字占满格、其余约 0.62 格」估 */
  function textWidth(s, fontSize) {
    let w = 0;
    for (const ch of String(s)) w += isWide(ch.codePointAt(0)) ? fontSize : fontSize * 0.62;
    return Math.round(w);
  }

  /**
   * anchorX / anchorY（基础库 2.1.0+）的原点是 marker 自身经纬度对应的屏幕点，
   * 所以想让气泡压住坐标点，就把气泡自己挪走半个身位。
   * 图标是 1×1 全透明 PNG（原生 marker 的 iconPath 必填，而形状/颜色/虚线都做不出来），
   * 视觉全在 label 上，故不能依赖 anchor——那个键只管图标、不管文字。
   * 官方文档未写明 anchorX/anchorY 的单位（全站也未出现 rpx），此处按 px 处理，需在真机复核。
   */
  function labelBox(text, opts) {
    const o = opts || {};
    const bw = o.borderWidth || 0;
    const w = textWidth(text, FONT) + (PAD + bw) * 2;
    const h = FONT + (PAD + bw) * 2;
    return {
      content: text,
      color: o.ink || '#FFFFFF',
      bgColor: o.bg || '#000000',
      borderWidth: bw,
      borderColor: o.borderColor || '#FFFFFF00',
      borderRadius: o.borderRadius || 10,
      fontSize: FONT,
      padding: PAD,
      anchorX: -Math.round(w / 2),
      anchorY: -Math.round(h / 2)
    };
  }

  const CLUSTER_BG = '#B08A4F';
  const DOUBT_BORDER = '#FF9A3C';

  /** 单个图元的 label 文案 */
  function pinText(p) {
    return p.kind === 'tomb' ? p.label : String(p.label || '');
  }

  function pinLabel(p) {
    const text = pinText(p);
    if (p.kind === 'acc') {
      return labelBox(text, {
        bg: ACC_BG, ink: '#DCE3EA', borderWidth: 1,
        borderColor: hex8('#FFFFFF', 0.28), borderRadius: 6
      });
    }
    if (p.kind === 'cluster') {
      return labelBox(text, {
        bg: CLUSTER_BG, ink: inkFor(CLUSTER_BG), borderWidth: 1,
        borderColor: '#F0DCAE', borderRadius: 8
      });
    }
    const doubtful = p.renderClass === 'exact-doubtful';
    return labelBox(text, {
      bg: p.color, ink: inkFor(p.color),
      borderWidth: doubtful ? 2 : 1,
      borderColor: doubtful ? DOUBT_BORDER : hex8('#FFFFFF', 0.55),
      borderRadius: 20
    });
  }

  /**
   * 图元 → markers。原生只认数字 id，所以回传 keys 数组按下标反查图元 key。
   * members[i] 是这枚标记**代表的所有帝陵 id**：单体图钉就是它自己，
   * 聚类气泡是市内那一串——圈外淡化只能按成员判，按 key 判会把整市的气泡全淡掉。
   * @returns {{markers: Array, keys: Array<string>, members: Array<string[]>}}
   */
  function buildMarkers(pins) {
    const keys = [];
    const markers = [];
    const members = [];
    pins.forEach((p, i) => {
      if (p.lat == null || p.lng == null) return;
      keys[i] = p.key;
      members[i] = p.tombIds || [p.key];
      markers.push({
        id: i,
        latitude: p.lat,
        longitude: p.lng,
        iconPath: ICON,
        width: 1,
        height: 1,
        label: pinLabel(p)
      });
    });
    return { markers, keys, members };
  }

  // ── 邻居档（PRD F-01-3 的地图侧）────────────────────────────────────────
  // 中性蓝灰：星图那套「蓝=兄弟/红=父子/黄=配偶/灰=其他」是关系图的编码，
  // 借到这里会被读成「这两座陵有亲属关系」，所以另起一种颜色。
  const NB_LINE = '#4A6E8FD9';
  const NB_BG = '#26384A';
  // 陪葬墓专用中性色：朝代色是政权、四色是关系编码，借哪个都会让人数错对象
  const ACC_BG = '#33414F';
  const NB_EGO_BG = '#1D5C8A';

  /** 100 km 搜索圈：把「半径 100 km」这个判据画成看得见的范围，而不是只在列表里报数 */
  function neighborCircle(geo, radiusKm) {
    if (!geo || geo.lat == null) return null;
    // circle 的 color 是「填充色」而不是描边色（描边另有 strokeColor），所以填充必须自带低透明度，
    // 否则整个范围盘会把底图和图钉全部压掉。
    return {
      latitude: geo.lat, longitude: geo.lng,
      radius: radiusKm * 1000,
      color: '#4A6E8F14', strokeColor: '#4A6E8FB3', strokeWidth: 1, zIndex: 0
    };
  }

  /** 气泡上限：原生 marker 只有 label 可用，一屏二十几个气泡会互相压盖 */
  const NEIGHBOR_LIMIT = 12;

  /**
   * 邻居层 → { markers, keys, lines, drawn, places, tombs, total }。
   *
   * 只画「距离可比」的那一档：任一方只有市级质心时 neighborList 给的是 null（不可比），
   * 而市级质心根本不在底图上画点，所以拿它当圆心画出来的圆量的是这座市、不是这座陵。
   * 因此**调用方必须先用 tombs.mappable 把关**，不可上图的陵只出列表、不建这一层。
   *
   * 同坐标的多座（共用一处陵域）并成一枚「N座·X km」，否则气泡会完全重叠。
   * @param ego      选中的陵（取 _g 作为 GCJ-02 渲染坐标）
   * @param list     tombs.detail().neighbors，已按距离升序、不可比的排在末尾
   * @param keysById Map<id, 名册记录>，用于取渲染坐标
   */
  function buildNeighborLayer(ego, list, keysById, opts) {
    const o = opts || {};
    const limit = o.limit || NEIGHBOR_LIMIT;
    const all = list || [];
    const comparable = all.filter(nb => nb.km != null);
    const groups = [];
    const byCoord = new Map();
    for (const nb of comparable) {
      const m = keysById.get(nb.id);
      if (!m || m.lat == null || !m._g) continue;
      const k = m._g.lat.toFixed(4) + ',' + m._g.lng.toFixed(4);
      let g = byCoord.get(k);
      if (!g) { g = { lat: m._g.lat, lng: m._g.lng, km: nb.km, ids: [] }; byCoord.set(k, g); groups.push(g); }
      g.ids.push(nb.id);
    }
    const shown = groups.slice(0, limit);
    const markers = [];
    const keys = [];
    const members = [];
    const lines = [];
    if (ego && ego._g) {
      keys[0] = ego.id;
      members[0] = [ego.id];
      markers.push({
        id: 0, latitude: ego._g.lat, longitude: ego._g.lng,
        iconPath: ICON, width: 1, height: 1,
        label: labelBox('◎' + String(ego.name_cn || '').slice(0, 6),
          { bg: NB_EGO_BG, ink: '#FFFFFF', borderWidth: 1, borderColor: hex8('#FFFFFF', 0.7), borderRadius: 9 })
      });
    }
    for (const g of shown) {
      const id = markers.length;
      keys[id] = g.ids[0];
      members[id] = g.ids.slice();
      markers.push({
        id, latitude: g.lat, longitude: g.lng,
        iconPath: ICON, width: 1, height: 1,
        label: labelBox(g.ids.length > 1 ? g.ids.length + '座·' + g.km + 'km' : g.km + 'km',
          { bg: NB_BG, ink: '#FFFFFF', borderWidth: 1, borderColor: hex8(NB_LINE, 0.85), borderRadius: 8 })
      });
      if (ego && ego._g) {
        lines.push({
          points: [{ latitude: ego._g.lat, longitude: ego._g.lng }, { latitude: g.lat, longitude: g.lng }],
          color: NB_LINE, width: 1, dottedLine: true, zIndex: 1
        });
      }
    }
    return {
      markers, keys, members, lines,
      drawn: shown.length, places: groups.length, tombs: comparable.length, total: all.length
    };
  }

  /**
   * 邻居气泡叠到底图气泡之上。原生 marker 的 id 必须全局唯一（重复会静默丢画），
   * 所以叠加时重新编号，并按新下标重建 keys 反查表。
   */
  function mergeMarkerLayers(base, overlay) {
    const markers = base.markers.slice();
    const keys = base.keys.slice();
    const members = (base.members || []).slice();
    for (const m of (overlay && overlay.markers) || []) {
      const id = markers.length;
      markers.push(Object.assign({}, m, { id }));
      keys[id] = overlay.keys[m.id];
      const mem = overlay.members && overlay.members[m.id];
      members[id] = mem || (keys[id] == null ? [] : [keys[id]]);
    }
    return { markers, keys, members };
  }

  /**
   * F-01-8 圈外淡化：半径外的图钉压暗，圈内与本陵保持原样。
   *
   * 这里**刻意不用任何透明度**——先前用的是 label 的 8 位十六进制 alpha，
   * 而"原生 <map> 的 cover-label 是否按 alpha 通道渲染"我们无法在校验器里证明，
   * 一旦基座忽略它就变成静默不生效（比不淡化更糟）。改成实色压暗后，
   * 效果只取决于颜色本身，任何基座都成立，也能被 check_map_page 数值断言锁住。
   *
   * 压暗是把朝代色朝深色底混合（保留色相），所以淡化后仍能看出是哪个朝代；
   * 字色用固定弱灰，与压暗后的底仍有明显对比——不是"消失了"。
   */
  const DIM_TOWARD = [0x12, 0x10, 0x0E];  // 页面底色 #12100E
  const DIM_INK = '#8B897F';
  const DIM_STRENGTH = 0.78;
  function mixTo(hex, k) {
    const h = String(hex || '').replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h.slice(0, 6);
    const n = i => parseInt(full.substr(i, 2), 16) || 0;
    const out = [0, 2, 4].map((i, j) => {
      const src = n(i);
      // 关键：比底色还暗的通道（隋色 #B8860B 的蓝是 0B，低于底色 0E）朝底色混合会**变亮**，
      // 所以逐通道夹住"不得高于原值"——压暗允许某通道不动，绝不允许它变亮。
      const v = Math.min(src, Math.round(src + (DIM_TOWARD[j] - src) * k));
      return Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
    });
    return '#' + out.join('').toUpperCase();
  }
  /** 谁保持原样：本陵 + 半径内邻居（含不可比的那些——它们只是不画气泡，仍在半径内） */
  function keepIdSet(egoId, neighbors) {
    return new Set([egoId].concat((neighbors || []).map(n => n.id)));
  }
  /**
   * 淡化判据（两个实现共用）：这枚标记代表的帝陵里只要有一座在圈内（含本陵），就保持原样。
   * 只能按成员判——聚类点的 key 是市名，按 key 判等于「放大到全国档、邻居层还开着」时
   * 全图气泡一起变暗，那不是淡化范围，是整张图消失。
   */
  function dimOutside(keepIds, members) {
    const keep = keepIds instanceof Set ? keepIds : new Set(keepIds || []);
    return !(members || []).some(id => id != null && keep.has(id));
  }
  function dimMarkersOutside(markers, members, keepIds, strength) {
    const k = strength == null ? DIM_STRENGTH : strength;
    return markers.map(m => {
      if (!dimOutside(keepIds, members[m.id])) return m;
      const L = m.label || {};
      return Object.assign({}, m, {
        label: Object.assign({}, L, {
          color: DIM_INK,
          bgColor: mixTo(L.bgColor, k),
          borderColor: mixTo(L.borderColor || L.bgColor, k)
        })
      });
    });
  }

  /**
   * 陪葬墓标记（PRD F-04-7）。与帝陵图钉刻意不同：帝陵是「朝代色圆 + 朝代首字」，
   * 这里用中性石板灰底 +「陪·名」——四色是关系编码、朝代色是政权，都不许被 143 座陪葬墓借用，
   * 否则读者会把陪葬墓数成帝陵。
   * 遵守 mergeMarkerLayers 的契约：markers 带内部 id 0..n-1，keys[内部id] = 该陪葬墓的 key，
   * 由合并方统一重编号，tap 处理函数再按 key 反查是哪一座。
   */
  function buildAccMarkers(acc) {
    const markers = [], keys = {};
    (acc || []).forEach((a, i) => {
      if (!a._g) return;
      markers.push({
        id: i, latitude: a._g.lat, longitude: a._g.lng,
        iconPath: ICON, width: 1, height: 1,
        label: pinLabel({ kind: 'acc', label: '陪·' + a.name, color: ACC_BG, renderClass: 'acc' })
      });
      keys[i] = a.key;
    });
    return { markers, keys };
  }

  return {
    ICON, FONT, PAD, CLUSTER_LON_SPAN, NB_LINE, NB_BG, NB_EGO_BG, NEIGHBOR_LIMIT,
    lonSpanFor, shouldCluster, hex8, inkFor, textWidth, labelBox,
    pinText, pinLabel, buildMarkers, buildAccMarkers, dimMarkersOutside,
    dimOutside, keepIdSet,
    neighborCircle, buildNeighborLayer, mergeMarkerLayers
  };
}));
