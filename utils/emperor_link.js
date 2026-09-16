/* 由 build_emperor_link.js 自动生成，勿手改。links=双源自洽的年份出口（只第一轮）；jumps=星图导航出口（身份唯一即可，不带年份）。UMD：小程序 module.exports，浏览器 window.__EMPEROR_LINK__ */
;(function (root, mod) {
  if (typeof module === "object" && module.exports) module.exports = mod;
  else root.__EMPEROR_LINK__ = mod;
}(typeof self !== "undefined" ? self : this, {
 "meta": {
  "rule": "links（年份）auto = 唯一同名节点 + 称谓后无亲属词 + 非多主同行 + |考录葬年 − CBDB 卒年| ≤ 2",
  "rule_jumps": "jumps（导航）= 已认领的 CBDB 人物号唯一反查到节点，或人名整段（折繁简）+ 通称/庙号 双段撞中同一节点且朝代一致。jumps 一个年份都不带：卡片上的生卒年仍只读 links",
  "source": "生卒年来自 CBDB 人物传记（经 star_map_data.json）；葬年来自《中国历代皇帝陵信息整理》",
  "retrieved": "2026-09-14",
  "linked": 71,
  "jump_note": "没在 jumps 里的帝陵，详情页与地图卡片都不显示星图入口——入口的有无是判据的结果，不是\"跳过去看看有没有\"",
  "linked_by_pass": {
   "auto": 71,
   "auto2": 36,
   "auto3": 7
  },
  "jumps": 147,
  "jumps_by_via": {
   "cbdb_id": 114,
   "name+title": 33
  },
  "back_note": "back = 节点 → 帝陵，只装唯一命中的那些。两处以上陵址抢同一节点的（数量见 back_clash）前向两边都能跳、回链不指任何一边，具体是哪几组在构建输出里列给人工裁决",
  "back": 145,
  "back_clash": 1
 },
 "links": {
  "qin-shihuang-ling": {
   "emperor_id": "qin-shi-huang",
   "cbdb_id": "562723",
   "emperor": "秦始皇",
   "node_dynasty": "秦",
   "birth": -259,
   "death": -210,
   "burial": -210,
   "delta": 0
  },
  "han-changling": {
   "emperor_id": "han-gaozu",
   "cbdb_id": "16622",
   "emperor": "汉高祖",
   "node_dynasty": "西汉",
   "birth": -256,
   "death": -195,
   "burial": -195,
   "delta": 0
  },
  "han-anling": {
   "emperor_id": "e16623",
   "cbdb_id": "16623",
   "emperor": "汉惠帝",
   "node_dynasty": "西汉",
   "birth": -205,
   "death": -188,
   "burial": -188,
   "delta": 0
  },
  "han-yangling": {
   "emperor_id": "han-jingdi",
   "cbdb_id": "16625",
   "emperor": "汉景帝",
   "node_dynasty": "西汉",
   "birth": -188,
   "death": -140,
   "burial": -141,
   "delta": -1
  },
  "han-maoling": {
   "emperor_id": "han-wudi",
   "cbdb_id": "16626",
   "emperor": "汉武帝",
   "node_dynasty": "西汉",
   "birth": -156,
   "death": -87,
   "burial": -87,
   "delta": 0
  },
  "han-pingling": {
   "emperor_id": "han-zhaodi",
   "cbdb_id": "16627",
   "emperor": "汉昭帝",
   "node_dynasty": "西汉",
   "birth": -94,
   "death": -73,
   "burial": -74,
   "delta": -1
  },
  "han-weiling": {
   "emperor_id": "han-yuandi",
   "cbdb_id": "135026",
   "emperor": "汉元帝",
   "node_dynasty": "西汉",
   "birth": -75,
   "death": -33,
   "burial": -33,
   "delta": 0
  },
  "han-yanling": {
   "emperor_id": "han-chengdi",
   "cbdb_id": "135029",
   "emperor": "汉成帝",
   "node_dynasty": "西汉",
   "birth": -52,
   "death": -7,
   "burial": -7,
   "delta": 0
  },
  "han-baling": {
   "emperor_id": "han-wendi",
   "cbdb_id": "16624",
   "emperor": "汉文帝",
   "node_dynasty": "西汉",
   "birth": -202,
   "death": -157,
   "burial": -157,
   "delta": 0
  },
  "han-duling": {
   "emperor_id": "han-xuandi",
   "cbdb_id": "16628",
   "emperor": "汉宣帝",
   "node_dynasty": "西汉",
   "birth": -91,
   "death": -49,
   "burial": -49,
   "delta": 0
  },
  "han-yuanling": {
   "emperor_id": "guang-wudi",
   "cbdb_id": "24661",
   "emperor": "汉光武帝",
   "node_dynasty": "东汉",
   "birth": -4,
   "death": 57,
   "burial": 57,
   "delta": 0
  },
  "han-shenling": {
   "emperor_id": "e24665",
   "cbdb_id": "24665",
   "emperor": "汉和帝",
   "node_dynasty": "东汉",
   "birth": 80,
   "death": 106,
   "burial": 105,
   "delta": -1
  },
  "han-jingling-dong": {
   "emperor_id": "han-zhangdi",
   "cbdb_id": "24664",
   "emperor": "汉章帝",
   "node_dynasty": "东汉",
   "birth": 57,
   "death": 89,
   "burial": 88,
   "delta": -1
  },
  "han-gongling": {
   "emperor_id": "e24667",
   "cbdb_id": "24667",
   "emperor": "汉安帝",
   "node_dynasty": "东汉",
   "birth": 98,
   "death": 125,
   "burial": 125,
   "delta": 0
  },
  "han-xianling": {
   "emperor_id": "e24668",
   "cbdb_id": "24668",
   "emperor": "汉顺帝",
   "node_dynasty": "东汉",
   "birth": 116,
   "death": 145,
   "burial": 144,
   "delta": -1
  },
  "han-huailling": {
   "emperor_id": "e30262",
   "cbdb_id": "30262",
   "emperor": "汉冲帝",
   "node_dynasty": "东汉",
   "birth": 144,
   "death": 146,
   "burial": 145,
   "delta": -1
  },
  "han-wenling": {
   "emperor_id": "e30265",
   "cbdb_id": "30265",
   "emperor": "汉灵帝",
   "node_dynasty": "东汉",
   "birth": 156,
   "death": 189,
   "burial": 189,
   "delta": 0
  },
  "han-jingling2": {
   "emperor_id": "e30263",
   "cbdb_id": "30263",
   "emperor": "汉质帝",
   "node_dynasty": "东汉",
   "birth": 139,
   "death": 147,
   "burial": 146,
   "delta": -1
  },
  "han-xuanling": {
   "emperor_id": "e30264",
   "cbdb_id": "30264",
   "emperor": "汉桓帝",
   "node_dynasty": "东汉",
   "birth": 133,
   "death": 168,
   "burial": 168,
   "delta": 0
  },
  "han-kangling-dong": {
   "emperor_id": "e24666",
   "cbdb_id": "24666",
   "emperor": "汉殇帝",
   "node_dynasty": "东汉",
   "birth": 106,
   "death": 107,
   "burial": 106,
   "delta": -1
  },
  "han-chanling": {
   "emperor_id": "e30267",
   "cbdb_id": "30267",
   "emperor": "汉献帝",
   "node_dynasty": "东汉",
   "birth": 190,
   "death": 234,
   "burial": 234,
   "delta": 0
  },
  "beiwei-changling": {
   "emperor_id": "yuan-hong",
   "cbdb_id": "28919",
   "emperor": "北魏孝文帝",
   "node_dynasty": "北魏",
   "birth": 467,
   "death": 499,
   "burial": 499,
   "delta": 0
  },
  "beiwei-dingling": {
   "emperor_id": "e31010",
   "cbdb_id": "31010",
   "emperor": "北魏孝明帝",
   "node_dynasty": "北魏",
   "birth": null,
   "death": 528,
   "burial": 528,
   "delta": 0
  },
  "beizhou-xiaoling": {
   "emperor_id": "e31773",
   "cbdb_id": "31773",
   "emperor": "北周武帝",
   "node_dynasty": "北周",
   "birth": 542,
   "death": 578,
   "burial": 578,
   "delta": 0
  },
  "sui-tailing": {
   "emperor_id": "yang-jian",
   "cbdb_id": "30956",
   "emperor": "隋文帝",
   "node_dynasty": "隋",
   "birth": 541,
   "death": 604,
   "burial": 604,
   "delta": 0
  },
  "sui-yangdi-mu": {
   "emperor_id": "yang-guang",
   "cbdb_id": "30957",
   "emperor": "隋炀帝",
   "node_dynasty": "隋",
   "birth": 580,
   "death": 618,
   "burial": 618,
   "delta": 0
  },
  "cao-pi-shouyang-ling": {
   "emperor_id": "cao-pi",
   "cbdb_id": "30261",
   "emperor": "魏文帝",
   "node_dynasty": "三国魏",
   "birth": 187,
   "death": 226,
   "burial": 226,
   "delta": 0
  },
  "tang-xianling": {
   "emperor_id": "li-yuan",
   "cbdb_id": "13059",
   "emperor": "唐高祖",
   "node_dynasty": "唐",
   "birth": 566,
   "death": 635,
   "burial": 635,
   "delta": 0
  },
  "tang-zhaoling": {
   "emperor_id": "li-shimin",
   "cbdb_id": "13060",
   "emperor": "唐太宗",
   "node_dynasty": "唐",
   "birth": 598,
   "death": 649,
   "burial": 649,
   "delta": 0
  },
  "tang-qianling": {
   "emperor_id": "li-zhi",
   "cbdb_id": "19241",
   "emperor": "唐高宗",
   "node_dynasty": "唐",
   "birth": 628,
   "death": 683,
   "burial": 684,
   "delta": 1
  },
  "tang-dingling": {
   "emperor_id": "e19242",
   "cbdb_id": "19242",
   "emperor": "唐中宗",
   "node_dynasty": "唐",
   "birth": 656,
   "death": 710,
   "burial": 710,
   "delta": 0
  },
  "tang-qiaoling": {
   "emperor_id": "e19243",
   "cbdb_id": "19243",
   "emperor": "唐睿宗",
   "node_dynasty": "唐",
   "birth": 662,
   "death": 716,
   "burial": 716,
   "delta": 0
  },
  "tang-tailing": {
   "emperor_id": "li-longji",
   "cbdb_id": "19244",
   "emperor": "唐玄宗",
   "node_dynasty": "唐",
   "birth": 685,
   "death": 762,
   "burial": 763,
   "delta": 1
  },
  "tang-yuanling": {
   "emperor_id": "e19246",
   "cbdb_id": "19246",
   "emperor": "唐代宗",
   "node_dynasty": "唐",
   "birth": 727,
   "death": 779,
   "burial": 779,
   "delta": 0
  },
  "tang-chongling": {
   "emperor_id": "e19247",
   "cbdb_id": "19247",
   "emperor": "唐德宗",
   "node_dynasty": "唐",
   "birth": 742,
   "death": 805,
   "burial": 805,
   "delta": 0
  },
  "tang-jingling-tang": {
   "emperor_id": "li-chun",
   "cbdb_id": "166933",
   "emperor": "唐宪宗",
   "node_dynasty": "唐",
   "birth": 772,
   "death": 820,
   "burial": 820,
   "delta": 0
  },
  "tang-guangling": {
   "emperor_id": "e189264",
   "cbdb_id": "189264",
   "emperor": "唐穆宗",
   "node_dynasty": "唐",
   "birth": 794,
   "death": 824,
   "burial": 824,
   "delta": 0
  },
  "tang-zhangling": {
   "emperor_id": "e189272",
   "cbdb_id": "189272",
   "emperor": "唐文宗",
   "node_dynasty": "唐",
   "birth": 808,
   "death": 840,
   "burial": 840,
   "delta": 0
  },
  "tang-duanling": {
   "emperor_id": "e19253",
   "cbdb_id": "19253",
   "emperor": "唐武宗",
   "node_dynasty": "唐",
   "birth": 814,
   "death": 846,
   "burial": 846,
   "delta": 0
  },
  "tang-zhenling": {
   "emperor_id": "e19254",
   "cbdb_id": "19254",
   "emperor": "唐宣宗",
   "node_dynasty": "唐",
   "birth": 810,
   "death": 859,
   "burial": 860,
   "delta": 1
  },
  "tang-jianling2": {
   "emperor_id": "e189289",
   "cbdb_id": "189289",
   "emperor": "唐懿宗",
   "node_dynasty": "唐",
   "birth": 883,
   "death": 873,
   "burial": 874,
   "delta": 1
  },
  "tang-jingling": {
   "emperor_id": "e189295",
   "cbdb_id": "189295",
   "emperor": "唐僖宗",
   "node_dynasty": "唐",
   "birth": 862,
   "death": 888,
   "burial": 888,
   "delta": 0
  },
  "tang-zhuangling": {
   "emperor_id": "e189266",
   "cbdb_id": "189266",
   "emperor": "唐敬宗",
   "node_dynasty": "唐",
   "birth": 808,
   "death": 826,
   "burial": 827,
   "delta": 1
  },
  "tang-fengling": {
   "emperor_id": "e189199",
   "cbdb_id": "189199",
   "emperor": "唐顺宗",
   "node_dynasty": "唐",
   "birth": 761,
   "death": 806,
   "burial": 806,
   "delta": 0
  },
  "tang-heling": {
   "emperor_id": "e189298",
   "cbdb_id": "189298",
   "emperor": "唐昭宗",
   "node_dynasty": "唐",
   "birth": 867,
   "death": 904,
   "burial": 905,
   "delta": 1
  },
  "song-yongchang-ling": {
   "emperor_id": "zhao-kuanyin",
   "cbdb_id": "9001",
   "emperor": "宋太祖",
   "node_dynasty": "北宋",
   "birth": 927,
   "death": 976,
   "burial": 977,
   "delta": 1
  },
  "song-yongxi-ling": {
   "emperor_id": "zhao-kuangyi",
   "cbdb_id": "9002",
   "emperor": "宋太宗",
   "node_dynasty": "北宋",
   "birth": 939,
   "death": 997,
   "burial": 997,
   "delta": 0
  },
  "song-yongding-ling": {
   "emperor_id": "e9003",
   "cbdb_id": "9003",
   "emperor": "宋真宗",
   "node_dynasty": "北宋",
   "birth": 968,
   "death": 1022,
   "burial": 1022,
   "delta": 0
  },
  "song-yongzhao-ling": {
   "emperor_id": "zhao-zhen",
   "cbdb_id": "9004",
   "emperor": "宋仁宗",
   "node_dynasty": "北宋",
   "birth": 1010,
   "death": 1063,
   "burial": 1063,
   "delta": 0
  },
  "song-yonghou-ling": {
   "emperor_id": "e9005",
   "cbdb_id": "9005",
   "emperor": "宋英宗",
   "node_dynasty": "北宋",
   "birth": 1032,
   "death": 1067,
   "burial": 1067,
   "delta": 0
  },
  "song-yongyu-ling": {
   "emperor_id": "zhao-xu",
   "cbdb_id": "9006",
   "emperor": "宋神宗",
   "node_dynasty": "北宋",
   "birth": 1048,
   "death": 1085,
   "burial": 1085,
   "delta": 0
  },
  "song-yongtai-ling": {
   "emperor_id": "e9007",
   "cbdb_id": "9007",
   "emperor": "宋哲宗",
   "node_dynasty": "北宋",
   "birth": 1076,
   "death": 1100,
   "burial": 1100,
   "delta": 0
  },
  "ming-xiaoling": {
   "emperor_id": "zhu-yuanzhang",
   "cbdb_id": "30148",
   "emperor": "明太祖",
   "node_dynasty": "明",
   "birth": 1328,
   "death": 1398,
   "burial": 1398,
   "delta": 0
  },
  "ming-changling": {
   "emperor_id": "zhu-di",
   "cbdb_id": "30151",
   "emperor": "明成祖",
   "node_dynasty": "明",
   "birth": 1360,
   "death": 1424,
   "burial": 1424,
   "delta": 0
  },
  "ming-xianling2": {
   "emperor_id": "e30152",
   "cbdb_id": "30152",
   "emperor": "明仁宗",
   "node_dynasty": "明",
   "birth": 1378,
   "death": 1425,
   "burial": 1425,
   "delta": 0
  },
  "ming-jingling": {
   "emperor_id": "zhu-zhanji",
   "cbdb_id": "30153",
   "emperor": "明宣宗",
   "node_dynasty": "明",
   "birth": 1398,
   "death": 1435,
   "burial": 1435,
   "delta": 0
  },
  "ming-yuling-ming": {
   "emperor_id": "e30154",
   "cbdb_id": "30154",
   "emperor": "明英宗",
   "node_dynasty": "明",
   "birth": 1427,
   "death": 1464,
   "burial": 1464,
   "delta": 0
  },
  "ming-tailing-ming": {
   "emperor_id": "e30157",
   "cbdb_id": "30157",
   "emperor": "明孝宗",
   "node_dynasty": "明",
   "birth": 1470,
   "death": 1505,
   "burial": 1505,
   "delta": 0
  },
  "ming-kangling-ming": {
   "emperor_id": "e30158",
   "cbdb_id": "30158",
   "emperor": "明武宗",
   "node_dynasty": "明",
   "birth": 1491,
   "death": 1521,
   "burial": 1521,
   "delta": 0
  },
  "ming-yongling-ming": {
   "emperor_id": "e30160",
   "cbdb_id": "30160",
   "emperor": "明世宗",
   "node_dynasty": "明",
   "birth": 1508,
   "death": 1566,
   "burial": 1567,
   "delta": 1
  },
  "ming-zhaoling-ming": {
   "emperor_id": "e30161",
   "cbdb_id": "30161",
   "emperor": "明穆宗",
   "node_dynasty": "明",
   "birth": 1537,
   "death": 1572,
   "burial": 1572,
   "delta": 0
  },
  "ming-dingling-ming": {
   "emperor_id": "zhu-yijun",
   "cbdb_id": "30162",
   "emperor": "明神宗",
   "node_dynasty": "明",
   "birth": 1563,
   "death": 1620,
   "burial": 1620,
   "delta": 0
  },
  "ming-qingling-ming": {
   "emperor_id": "e30163",
   "cbdb_id": "30163",
   "emperor": "明光宗",
   "node_dynasty": "明",
   "birth": 1582,
   "death": 1620,
   "burial": 1620,
   "delta": 0
  },
  "qing-zhaoling-qing": {
   "emperor_id": "e64551",
   "cbdb_id": "64551",
   "emperor": "清太宗",
   "node_dynasty": "清",
   "birth": 1592,
   "death": 1643,
   "burial": 1643,
   "delta": 0
  },
  "wanan-ling": {
   "emperor_id": "e12828",
   "cbdb_id": "12828",
   "emperor": "陈武帝",
   "node_dynasty": "陈",
   "birth": 503,
   "death": 559,
   "burial": 559,
   "delta": 0
  },
  "gaoping-ling": {
   "emperor_id": "e30271",
   "cbdb_id": "30271",
   "emperor": "魏明帝",
   "node_dynasty": "三国魏",
   "birth": 205,
   "death": 240,
   "burial": 239,
   "delta": -1
  },
  "doc-17": {
   "emperor_id": "han-mingdi",
   "cbdb_id": "24662",
   "emperor": "汉明帝",
   "node_dynasty": "东汉",
   "birth": 29,
   "death": 76,
   "burial": 75,
   "delta": -1
  },
  "doc-32": {
   "emperor_id": "e30274",
   "cbdb_id": "30274",
   "emperor": "魏元帝",
   "node_dynasty": "三国魏",
   "birth": 245,
   "death": 302,
   "burial": 302,
   "delta": 0
  },
  "doc-95": {
   "emperor_id": "e31013",
   "cbdb_id": "31013",
   "emperor": "东魏孝静帝",
   "node_dynasty": "东魏",
   "birth": 524,
   "death": 551,
   "burial": 552,
   "delta": 1
  },
  "doc-96": {
   "emperor_id": "e31014",
   "cbdb_id": "31014",
   "emperor": "西魏文帝",
   "node_dynasty": "西魏",
   "birth": null,
   "death": 551,
   "burial": 551,
   "delta": 0
  },
  "doc-137": {
   "emperor_id": "e339634",
   "cbdb_id": "339634",
   "emperor": "唐哀帝",
   "node_dynasty": "唐",
   "birth": 892,
   "death": 908,
   "burial": 908,
   "delta": 0
  }
 },
 "jumps": {
  "qin-shihuang-ling": {
   "node": "qin-shi-huang",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "562723"
  },
  "han-changling": {
   "node": "han-gaozu",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "16622"
  },
  "han-anling": {
   "node": "e16623",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "16623"
  },
  "han-yangling": {
   "node": "han-jingdi",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "16625"
  },
  "han-maoling": {
   "node": "han-wudi",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "16626"
  },
  "han-pingling": {
   "node": "han-zhaodi",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "16627"
  },
  "han-weiling": {
   "node": "han-yuandi",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "135026"
  },
  "han-yanling": {
   "node": "han-chengdi",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "135029"
  },
  "han-yiling": {
   "node": "e339516",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339516"
  },
  "han-kangling-xi": {
   "node": "e339517",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339517"
  },
  "han-baling": {
   "node": "han-wendi",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "16624"
  },
  "han-duling": {
   "node": "han-xuandi",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "16628"
  },
  "han-yuanling": {
   "node": "guang-wudi",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "24661"
  },
  "han-shenling": {
   "node": "e24665",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "24665"
  },
  "han-jingling-dong": {
   "node": "han-zhangdi",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "24664"
  },
  "han-gongling": {
   "node": "e24667",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "24667"
  },
  "han-xianling": {
   "node": "e24668",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "24668"
  },
  "han-huailling": {
   "node": "e30262",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30262"
  },
  "han-wenling": {
   "node": "e30265",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30265"
  },
  "han-jingling2": {
   "node": "e30263",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30263"
  },
  "han-xuanling": {
   "node": "e30264",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30264"
  },
  "han-kangling-dong": {
   "node": "e24666",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "24666"
  },
  "han-chanling": {
   "node": "e30267",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30267"
  },
  "beiwei-changling": {
   "node": "yuan-hong",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "28919"
  },
  "beiwei-dingling": {
   "node": "e31010",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "31010"
  },
  "beizhou-xiaoling": {
   "node": "e31773",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "31773"
  },
  "sui-tailing": {
   "node": "yang-jian",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30956"
  },
  "sui-yangdi-mu": {
   "node": "yang-guang",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30957"
  },
  "sui-yangdi-jiu": {
   "node": "yang-guang",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "30957"
  },
  "cao-pi-shouyang-ling": {
   "node": "cao-pi",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30261"
  },
  "sun-quan-jiangling": {
   "node": "sun-quan",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "20609"
  },
  "tang-xianling": {
   "node": "li-yuan",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "13059"
  },
  "tang-zhaoling": {
   "node": "li-shimin",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "13060"
  },
  "tang-qianling": {
   "node": "li-zhi",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "19241"
  },
  "tang-dingling": {
   "node": "e19242",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "19242"
  },
  "tang-qiaoling": {
   "node": "e19243",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "19243"
  },
  "tang-tailing": {
   "node": "li-longji",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "19244"
  },
  "tang-jianling": {
   "node": "e19245",
   "via": "cbdb_id",
   "pass": "auto3",
   "cbdb_id": "19245"
  },
  "tang-yuanling": {
   "node": "e19246",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "19246"
  },
  "tang-chongling": {
   "node": "e19247",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "19247"
  },
  "tang-jingling-tang": {
   "node": "li-chun",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "166933"
  },
  "tang-guangling": {
   "node": "e189264",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "189264"
  },
  "tang-zhangling": {
   "node": "e189272",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "189272"
  },
  "tang-duanling": {
   "node": "e19253",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "19253"
  },
  "tang-zhenling": {
   "node": "e19254",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "19254"
  },
  "tang-jianling2": {
   "node": "e189289",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "189289"
  },
  "tang-jingling": {
   "node": "e189295",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "189295"
  },
  "tang-zhuangling": {
   "node": "e189266",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "189266"
  },
  "tang-fengling": {
   "node": "e189199",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "189199"
  },
  "tang-heling": {
   "node": "e189298",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "189298"
  },
  "houtang-huiling": {
   "node": "e339650",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339650"
  },
  "houzhou-qingling": {
   "node": "e22531",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "22531"
  },
  "houzhou-shunling": {
   "node": "e576557",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "576557"
  },
  "houjin-xianling": {
   "node": "e339657",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339657"
  },
  "song-yongchang-ling": {
   "node": "zhao-kuanyin",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "9001"
  },
  "song-yongxi-ling": {
   "node": "zhao-kuangyi",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "9002"
  },
  "song-yongding-ling": {
   "node": "e9003",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "9003"
  },
  "song-yongzhao-ling": {
   "node": "zhao-zhen",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "9004"
  },
  "song-yonghou-ling": {
   "node": "e9005",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "9005"
  },
  "song-yongyu-ling": {
   "node": "zhao-xu",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "9006"
  },
  "song-yongtai-ling": {
   "node": "e9007",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "9007"
  },
  "liao-zuling": {
   "node": "e29261",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "29261"
  },
  "liao-huailling": {
   "node": "e43077",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "43077"
  },
  "liao-xianling": {
   "node": "e29264",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "29264"
  },
  "liao-qianling": {
   "node": "e43105",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "43105"
  },
  "ming-xiaoling": {
   "node": "zhu-yuanzhang",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30148"
  },
  "ming-changling": {
   "node": "zhu-di",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30151"
  },
  "ming-xianling2": {
   "node": "e30152",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30152"
  },
  "ming-jingling": {
   "node": "zhu-zhanji",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30153"
  },
  "ming-yuling-ming": {
   "node": "e30154",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30154"
  },
  "ming-maoling-ming": {
   "node": "e30156",
   "via": "cbdb_id",
   "pass": "auto3",
   "cbdb_id": "30156"
  },
  "ming-tailing-ming": {
   "node": "e30157",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30157"
  },
  "ming-kangling-ming": {
   "node": "e30158",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30158"
  },
  "ming-yongling-ming": {
   "node": "e30160",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30160"
  },
  "ming-zhaoling-ming": {
   "node": "e30161",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30161"
  },
  "ming-dingling-ming": {
   "node": "zhu-yijun",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30162"
  },
  "ming-qingling-ming": {
   "node": "e30163",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30163"
  },
  "ming-siling": {
   "node": "zhu-youjian",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30165"
  },
  "qing-zhaoling-qing": {
   "node": "e64551",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "64551"
  },
  "qing-xiaoling": {
   "node": "e66074",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339771"
  },
  "qing-jingling": {
   "node": "kangxi",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "65884"
  },
  "qing-yuling-qing": {
   "node": "qianlong",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "55870"
  },
  "qing-dingling-qing": {
   "node": "e339777",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339777"
  },
  "qing-huiling-qing": {
   "node": "e54296",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339778"
  },
  "qing-tailing-qing": {
   "node": "yongzheng",
   "via": "name+title",
   "pass": "reject",
   "cbdb_id": "63801"
  },
  "qing-changling-qing": {
   "node": "e339775",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339775"
  },
  "qing-muling-qing": {
   "node": "e339776",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339776"
  },
  "qing-chongling": {
   "node": "guangxu",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339779"
  },
  "wanan-ling": {
   "node": "e12828",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "12828"
  },
  "gaoping-ling": {
   "node": "e30271",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30271"
  },
  "doc-17": {
   "node": "han-mingdi",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "24662"
  },
  "doc-30": {
   "node": "e30272",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30272"
  },
  "doc-31": {
   "node": "e30273",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30273"
  },
  "doc-32": {
   "node": "e30274",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "30274"
  },
  "doc-42": {
   "node": "sima-yan",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "21207"
  },
  "doc-43": {
   "node": "e30898",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30898"
  },
  "doc-44": {
   "node": "e30899",
   "via": "cbdb_id",
   "pass": "auto3",
   "cbdb_id": "30899"
  },
  "doc-45": {
   "node": "e30900",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30900"
  },
  "doc-46": {
   "node": "sima-rui",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "30902"
  },
  "doc-47": {
   "node": "e30903",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30903"
  },
  "doc-48": {
   "node": "e30905",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30905"
  },
  "doc-49": {
   "node": "e30906",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30906"
  },
  "doc-50": {
   "node": "e30907",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30907"
  },
  "doc-51": {
   "node": "e30908",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30908"
  },
  "doc-52": {
   "node": "e30909",
   "via": "name+title",
   "pass": "reject",
   "cbdb_id": "30909"
  },
  "doc-53": {
   "node": "e30910",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30910"
  },
  "doc-54": {
   "node": "e30911",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30911"
  },
  "doc-55": {
   "node": "e30912",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30912"
  },
  "doc-56": {
   "node": "e30913",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30913"
  },
  "doc-57": {
   "node": "liu-yu",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "12175"
  },
  "doc-66": {
   "node": "e12253",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "12253"
  },
  "doc-67": {
   "node": "e34005",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "34005"
  },
  "doc-69": {
   "node": "e34012",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "34012"
  },
  "doc-71": {
   "node": "xiao-yan",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "12254"
  },
  "doc-72": {
   "node": "e33251",
   "via": "cbdb_id",
   "pass": "auto3",
   "cbdb_id": "33251"
  },
  "doc-73": {
   "node": "e33252",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "33252"
  },
  "doc-74": {
   "node": "e339553",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339553"
  },
  "doc-76": {
   "node": "e21300",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "21300"
  },
  "doc-77": {
   "node": "e21301",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "21301"
  },
  "doc-78": {
   "node": "e21302",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "21302"
  },
  "doc-79": {
   "node": "e21303",
   "via": "cbdb_id",
   "pass": "auto3",
   "cbdb_id": "21303"
  },
  "doc-80": {
   "node": "tuoba-gui",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "31005"
  },
  "doc-81": {
   "node": "e31006",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "31006"
  },
  "doc-82": {
   "node": "tuoba-tao",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "31007"
  },
  "doc-84": {
   "node": "e31008",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "31008"
  },
  "doc-85": {
   "node": "e28918",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "28918"
  },
  "doc-87": {
   "node": "e31009",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "31009"
  },
  "doc-90": {
   "node": "e31011",
   "via": "cbdb_id",
   "pass": "auto3",
   "cbdb_id": "31011"
  },
  "doc-94": {
   "node": "e31012",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "31012"
  },
  "doc-95": {
   "node": "e31013",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "31013"
  },
  "doc-96": {
   "node": "e31014",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "31014"
  },
  "doc-97": {
   "node": "e339609",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339609"
  },
  "doc-98": {
   "node": "e339610",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339610"
  },
  "doc-99": {
   "node": "e339598",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339598"
  },
  "doc-100": {
   "node": "e339599",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339599"
  },
  "doc-101": {
   "node": "gao-yang",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339600"
  },
  "doc-103": {
   "node": "e339602",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339602"
  },
  "doc-104": {
   "node": "e339603",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339603"
  },
  "doc-105": {
   "node": "e339604",
   "via": "name+title",
   "pass": "reject",
   "cbdb_id": "339604"
  },
  "doc-110": {
   "node": "e31771",
   "via": "cbdb_id",
   "pass": "auto3",
   "cbdb_id": "31771"
  },
  "doc-111": {
   "node": "e31772",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "31772"
  },
  "doc-113": {
   "node": "e339613",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339613"
  },
  "doc-117": {
   "node": "e339617",
   "via": "name+title",
   "pass": "review",
   "cbdb_id": "339617"
  },
  "doc-137": {
   "node": "e339634",
   "via": "cbdb_id",
   "pass": "auto",
   "cbdb_id": "339634"
  },
  "doc-167": {
   "node": "e30150",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30150"
  },
  "doc-172": {
   "node": "e30155",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30155"
  },
  "doc-180": {
   "node": "e30164",
   "via": "cbdb_id",
   "pass": "auto2",
   "cbdb_id": "30164"
  }
 },
 "back": {
  "qin-shi-huang": "qin-shihuang-ling",
  "han-gaozu": "han-changling",
  "e16623": "han-anling",
  "han-jingdi": "han-yangling",
  "han-wudi": "han-maoling",
  "han-zhaodi": "han-pingling",
  "han-yuandi": "han-weiling",
  "han-chengdi": "han-yanling",
  "e339516": "han-yiling",
  "e339517": "han-kangling-xi",
  "han-wendi": "han-baling",
  "han-xuandi": "han-duling",
  "guang-wudi": "han-yuanling",
  "e24665": "han-shenling",
  "han-zhangdi": "han-jingling-dong",
  "e24667": "han-gongling",
  "e24668": "han-xianling",
  "e30262": "han-huailling",
  "e30265": "han-wenling",
  "e30263": "han-jingling2",
  "e30264": "han-xuanling",
  "e24666": "han-kangling-dong",
  "e30267": "han-chanling",
  "yuan-hong": "beiwei-changling",
  "e31010": "beiwei-dingling",
  "e31773": "beizhou-xiaoling",
  "yang-jian": "sui-tailing",
  "cao-pi": "cao-pi-shouyang-ling",
  "sun-quan": "sun-quan-jiangling",
  "li-yuan": "tang-xianling",
  "li-shimin": "tang-zhaoling",
  "li-zhi": "tang-qianling",
  "e19242": "tang-dingling",
  "e19243": "tang-qiaoling",
  "li-longji": "tang-tailing",
  "e19245": "tang-jianling",
  "e19246": "tang-yuanling",
  "e19247": "tang-chongling",
  "li-chun": "tang-jingling-tang",
  "e189264": "tang-guangling",
  "e189272": "tang-zhangling",
  "e19253": "tang-duanling",
  "e19254": "tang-zhenling",
  "e189289": "tang-jianling2",
  "e189295": "tang-jingling",
  "e189266": "tang-zhuangling",
  "e189199": "tang-fengling",
  "e189298": "tang-heling",
  "e339650": "houtang-huiling",
  "e22531": "houzhou-qingling",
  "e576557": "houzhou-shunling",
  "e339657": "houjin-xianling",
  "zhao-kuanyin": "song-yongchang-ling",
  "zhao-kuangyi": "song-yongxi-ling",
  "e9003": "song-yongding-ling",
  "zhao-zhen": "song-yongzhao-ling",
  "e9005": "song-yonghou-ling",
  "zhao-xu": "song-yongyu-ling",
  "e9007": "song-yongtai-ling",
  "e29261": "liao-zuling",
  "e43077": "liao-huailling",
  "e29264": "liao-xianling",
  "e43105": "liao-qianling",
  "zhu-yuanzhang": "ming-xiaoling",
  "zhu-di": "ming-changling",
  "e30152": "ming-xianling2",
  "zhu-zhanji": "ming-jingling",
  "e30154": "ming-yuling-ming",
  "e30156": "ming-maoling-ming",
  "e30157": "ming-tailing-ming",
  "e30158": "ming-kangling-ming",
  "e30160": "ming-yongling-ming",
  "e30161": "ming-zhaoling-ming",
  "zhu-yijun": "ming-dingling-ming",
  "e30163": "ming-qingling-ming",
  "zhu-youjian": "ming-siling",
  "e64551": "qing-zhaoling-qing",
  "e66074": "qing-xiaoling",
  "kangxi": "qing-jingling",
  "qianlong": "qing-yuling-qing",
  "e339777": "qing-dingling-qing",
  "e54296": "qing-huiling-qing",
  "yongzheng": "qing-tailing-qing",
  "e339775": "qing-changling-qing",
  "e339776": "qing-muling-qing",
  "guangxu": "qing-chongling",
  "e12828": "wanan-ling",
  "e30271": "gaoping-ling",
  "han-mingdi": "doc-17",
  "e30272": "doc-30",
  "e30273": "doc-31",
  "e30274": "doc-32",
  "sima-yan": "doc-42",
  "e30898": "doc-43",
  "e30899": "doc-44",
  "e30900": "doc-45",
  "sima-rui": "doc-46",
  "e30903": "doc-47",
  "e30905": "doc-48",
  "e30906": "doc-49",
  "e30907": "doc-50",
  "e30908": "doc-51",
  "e30909": "doc-52",
  "e30910": "doc-53",
  "e30911": "doc-54",
  "e30912": "doc-55",
  "e30913": "doc-56",
  "liu-yu": "doc-57",
  "e12253": "doc-66",
  "e34005": "doc-67",
  "e34012": "doc-69",
  "xiao-yan": "doc-71",
  "e33251": "doc-72",
  "e33252": "doc-73",
  "e339553": "doc-74",
  "e21300": "doc-76",
  "e21301": "doc-77",
  "e21302": "doc-78",
  "e21303": "doc-79",
  "tuoba-gui": "doc-80",
  "e31006": "doc-81",
  "tuoba-tao": "doc-82",
  "e31008": "doc-84",
  "e28918": "doc-85",
  "e31009": "doc-87",
  "e31011": "doc-90",
  "e31012": "doc-94",
  "e31013": "doc-95",
  "e31014": "doc-96",
  "e339609": "doc-97",
  "e339610": "doc-98",
  "e339598": "doc-99",
  "e339599": "doc-100",
  "gao-yang": "doc-101",
  "e339602": "doc-103",
  "e339603": "doc-104",
  "e339604": "doc-105",
  "e31771": "doc-110",
  "e31772": "doc-111",
  "e339613": "doc-113",
  "e339617": "doc-117",
  "e339634": "doc-137",
  "e30150": "doc-167",
  "e30155": "doc-172",
  "e30164": "doc-180"
 }
}));
