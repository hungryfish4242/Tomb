/**
 * places.js 的索引与选择链。UMD：小程序 require，浏览器 <script> 后取 window.PlacesView。
 *
 * 抽出来的唯一理由：「省→市→县，直辖市的区没有市级中间层」这条列数规则
 * 在小程序与镜像各写一遍，一定会长成两套。
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PlacesView = api;
}(typeof self !== 'undefined' ? self : this, function () {
  function createPlaces(mod) {
    const rows = (mod && mod.places) || [];
    const byAdcode = new Map();
    const kids = new Map();
    for (const r of rows) byAdcode.set(r.a, r);
    for (const r of rows) {
      if (!byAdcode.has(r.p)) continue;
      const list = kids.get(r.p);
      if (list) list.push(r); else kids.set(r.p, [r]);
    }
    for (const list of kids.values()) list.sort((a, b) => a.a - b.a);
    const provinces = rows.filter(r => r.l === 1).sort((a, b) => a.a - b.a);
    // 同名跨省重复的区县不少（城东区、郊区…），按 adcode 序取第一个，
    // 这样锚点表用名字找点位是可复现的，不会每次跑到另一个县
    const byName = new Map();
    for (const r of rows) if (!byName.has(r.n)) byName.set(r.n, r);

    const childrenOf = a => kids.get(a) || [];
    const leafAt = a => !childrenOf(a).length;

    /** 已选序列对应的各列：未选时只有第一列；选到叶子就停止加列 */
    function columnsOf(sel) {
      const cols = [provinces];
      for (const a of (sel || [])) {
        const list = childrenOf(a);
        if (!list.length) break;
        cols.push(list);
      }
      return cols;
    }

    /** 本行往上数到省，含本行：[省, 市, 县]。走不出环（源数据异常）时最多 4 级即停 */
    function chainOf(a) {
      const out = [];
      let cur = byAdcode.get(a);
      while (cur && out.length < 4) { out.unshift(cur); cur = byAdcode.get(cur.p); }
      return out;
    }

    const namesOf = sel => (sel || []).map(a => (byAdcode.get(a) || {}).n).filter(Boolean);
    /** 位置点：算距离前的 GCJ-02 原始点，语义见 places.js 的 meta.semantic_note */
    const at = a => { const r = byAdcode.get(a); return r ? r.c : null; };

    return {
      count: rows.length, rows, provinces, byAdcode, byName,
      childrenOf, columnsOf, leafAt, chainOf, namesOf, at
    };
  }
  return { createPlaces };
}));
