// 星图收录范围的常驻说明（PRD §4.5.4）。小程序与浏览器镜像共用这一份（UMD）：
// 图上少画了一批人，界面上就必须说清"少画"这件事本身，否则沉默会被读成史料结论。
// 数字一律取自 star_map_data.json 的 meta，写死就会在下次重建管线时变成假话。
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GraphNote = api;
}(typeof self !== 'undefined' ? self : this, function () {
  /**
   * @param meta star_map_data.json 的 meta（含 emperor_count / total_nodes / total_edges /
   *             expansion_used / pruned_leaf_nodes）
   * @param originBreakdown 可选，节点按来源（emperor/direct/expanded/supplement）的计数
   */
  function graphNote(meta, originBreakdown) {
    const m = meta || {};
    const parts = [];
    parts.push('本图只收录 ' + (m.emperor_count == null ? '?' : m.emperor_count)
      + ' 位皇帝的亲属关系网（' + (m.total_nodes || '?') + ' 节点 / ' + (m.total_edges || '?') + ' 条关系）。');
    if (m.pruned_leaf_nodes) {
      parts.push('构建期剪去 ' + m.pruned_leaf_nodes
        + ' 个「不桥接任何皇帝」的一级展开叶子以降低噪声：'
        + '某位皇帝在图上没有兄弟姐妹，不等于史料里没有，只表示本数据集未收录该人。');
    }
    if (originBreakdown && originBreakdown.expanded != null) {
      parts.push('保留的非皇帝人物 ' + ((originBreakdown.direct || 0) + (originBreakdown.expanded || 0)
        + (originBreakdown.supplement || 0)) + ' 位，来自 CBDB 亲属码与 Wikidata 补边。');
    }
    parts.push('连线颜色只表示关系类型：蓝=兄弟姐妹，红=父子/母子，黄=配偶与姻亲，灰=其他。');
    return parts.join(' ');
  }

  /**
   * 星图 → 帝陵回链的常驻说明。三个数都由调用方现算（回线条数、帝陵侧入口条数、星图皇帝数），
   * 写死就会在下次重建管线时变成假话。措辞要把两件事说分：这里数的是"人与陵认不认得对"，
   * 而卡片上有没有 CBDB 生卒年走的是另一条更严的双源互证。
   */
  function tombLinkNote(back, jumped, emperorCount) {
    return '中心人物若在帝陵连接表里，卡片上会多出「在地图上定位本陵」一项；'
      + '当前 ' + back + '/' + emperorCount + ' 位皇帝能认到一座帝陵（帝陵侧 ' + jumped
      + ' 座有星图入口）。认的是"这个人是这座陵的主"，与卡片上端不端 CBDB 生卒年是两条判据——'
      + '入口比年份宽，是因为走错图看得见、写错年看不见。'
      + '没有这一项只表示本数据集没把人与陵对上，不等于此人没有陵。';
  }

  /** 焦点没落地时那句：两端共用一份，谁都不许在页面里重打一遍 */
  const FOCUS_MISS = '帝陵侧给来的节点 id 在星图里没有对应的皇帝，这里显示的仍是默认中心。';

  return { graphNote, tombLinkNote, FOCUS_MISS };
}));
