// WGS-84 → GCJ-02。数据集一律存 WGS-84（Wikidata/OSM 给的就是 WGS-84），
// 微信 <map> 与国内底图瓦片是 GCJ-02，渲染前才转换（PRD §6.3 坐标系一致性警告）。
// 距离计算反过来必须在 WGS-84 上做，别拿转换后的坐标算 Haversine。
// UMD：小程序 require，浏览器镜像 <script> 引入，两份实现共用同一份逻辑。
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GeoJS = api;
}(typeof self !== 'undefined' ? self : this, function () {
  const A = 6378245.0;
  const EE = 0.00669342162296594323;
  const EARTH_RADIUS_KM = 6371.0;
  const toRad = d => d * Math.PI / 180;

  // 国境外不偏移：GCJ-02 只在中国境内加扰
  function outOfChina(lat, lng) {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
  }

  function transformLat(x, y) {
    let r = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    r += (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3;
    r += (160 * Math.sin(y / 12 * Math.PI) + 320 * Math.sin(y * Math.PI / 30)) * 2 / 3;
    return r;
  }

  function transformLng(x, y) {
    let r = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    r += (20 * Math.sin(x * Math.PI) + 40 * Math.sin(x / 3 * Math.PI)) * 2 / 3;
    r += (150 * Math.sin(x / 12 * Math.PI) + 300 * Math.sin(x / 30 * Math.PI)) * 2 / 3;
    return r;
  }

  function wgs84ToGcj02(lat, lng) {
    if (outOfChina(lat, lng)) return { lat, lng };
    const dLat0 = transformLat(lng - 105, lat - 35);
    const dLng0 = transformLng(lng - 105, lat - 35);
    const radLat = toRad(lat);
    let magic = Math.sin(radLat);
    magic = 1 - EE * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    const dLat = (dLat0 * 180) / ((A * (1 - EE)) / (magic * sqrtMagic) * Math.PI);
    const dLng = (dLng0 * 180) / (A / sqrtMagic * Math.cos(radLat) * Math.PI);
    return { lat: lat + dLat, lng: lng + dLng };
  }

  /**
   * GCJ-02 → WGS-84。偏移量本身是纬度的非线性函数，没有解析逆；
   * 用不动点迭代（每轮把残差补回去），三次即收敛到 1e-9° 以下，远小于点位自身精度。
   * 入库方向专用：数据集一律存 WGS-84，渲染时再走 wgs84ToGcj02。
   */
  function gcj02ToWgs84(lat, lng) {
    if (outOfChina(lat, lng)) return { lat, lng };
    let wLat = lat, wLng = lng;
    for (let i = 0; i < 3; i++) {
      const back = wgs84ToGcj02(wLat, wLng);
      wLat += lat - back.lat;
      wLng += lng - back.lng;
    }
    return { lat: wLat, lng: wLng };
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
  }

  /** 以 target 为圆心、radiusKm 内的其他帝陵，按直线距离升序（PRD §6.3） */
  function findNeighbors(target, all, radiusKm = 100) {
    if (target.lat == null) return [];
    return all
      .filter(m => m.id !== target.id && m.lat != null)
      .map(m => ({ m, distance: haversineKm(target.lat, target.lng, m.lat, m.lng) }))
      .filter(x => x.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  return { EARTH_RADIUS_KM, outOfChina, wgs84ToGcj02, gcj02ToWgs84, haversineKm, findNeighbors };
}));
