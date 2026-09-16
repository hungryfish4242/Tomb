/** 四视图互跳的唯一路由规则。
 *
 *  为什么要有这一份：以前每页各写一句 `wx.navigateBack()` 表示「回地图」，
 *  而 navigateBack 只退一层——从「地图 → 对比 → 时间轴」点「地图」，退的那一层是对比页，
 *  于是标签写着地图、落到的却是对比（2026-09-15 真机实测）。选项卡点一次压一页，
 *  绕几圈还会撞上小程序 10 层的页面栈上限。
 *
 *  规则只有一条：**目标视图若已在栈里就退回到它，否则压进去**。
 *  这里只算「退几层」，不碰 wx，好让校验器能在 node 里跑同一份判断。
 */
const ROUTE = {
  map: 'pages/map/map',
  timeline: 'pages/timeline/timeline',
  compare: 'pages/compare/compare',
  star: 'packageStar/pages/index/index'
};

const ROUTES = Object.keys(ROUTE).map(k => ROUTE[k]);

/** routes：从栈底到栈顶的路由数组，最后一个就是当前页。
 *  返回要退的层数；0 表示目标不在栈里（该 navigateTo）。 */
function hop(routes, target) {
  const list = routes || [];
  if (ROUTES.indexOf(target) < 0) return -1;
  for (let i = list.length - 2; i >= 0; i--) {
    if (list[i] === target) return list.length - 1 - i;
  }
  return 0;
}

module.exports = { ROUTE, ROUTES, hop };
