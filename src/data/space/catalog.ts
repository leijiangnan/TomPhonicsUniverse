export type CatalogNode = { id: string; name: string; kind: string; note: string; number: number };
export const spaceRegions: { id: number; name: string; nodes: CatalogNode[] }[] = [
  {
    "id": 1,
    "name": "地月空间",
    "nodes": [
      {
        "id": "earth",
        "name": "地球",
        "kind": "天体",
        "note": "",
        "number": 1
      },
      {
        "id": "catalog-2",
        "name": "国际空间站",
        "kind": "空间站",
        "note": "",
        "number": 2
      },
      {
        "id": "moon",
        "name": "月球",
        "kind": "天体",
        "note": "",
        "number": 3
      },
      {
        "id": "catalog-4",
        "name": "月球背面",
        "kind": "区域 / 位置",
        "note": "位置/区域",
        "number": 4
      },
      {
        "id": "catalog-5",
        "name": "地月 L2 点",
        "kind": "区域 / 位置",
        "note": "轨道动力学位置",
        "number": 5
      },
      {
        "id": "catalog-6",
        "name": "月球轨道空间站",
        "kind": "虚构设施",
        "note": "虚构关卡设施",
        "number": 6
      },
      {
        "id": "catalog-7",
        "name": "太阳观测站",
        "kind": "虚构设施",
        "note": "虚构关卡设施",
        "number": 7
      },
      {
        "id": "catalog-8",
        "name": "金星",
        "kind": "天体",
        "note": "",
        "number": 8
      }
    ]
  },
  {
    "id": 2,
    "name": "内太阳系",
    "nodes": [
      {
        "id": "catalog-9",
        "name": "水星",
        "kind": "天体",
        "note": "",
        "number": 9
      },
      {
        "id": "catalog-10",
        "name": "太阳观测轨道",
        "kind": "区域 / 位置",
        "note": "位置/区域",
        "number": 10
      },
      {
        "id": "mars",
        "name": "火星",
        "kind": "天体",
        "note": "",
        "number": 11
      },
      {
        "id": "catalog-12",
        "name": "火卫一",
        "kind": "天体",
        "note": "",
        "number": 12
      },
      {
        "id": "catalog-13",
        "name": "火卫二",
        "kind": "天体",
        "note": "",
        "number": 13
      },
      {
        "id": "catalog-14",
        "name": "灶神星",
        "kind": "天体",
        "note": "",
        "number": 14
      },
      {
        "id": "catalog-15",
        "name": "小行星带",
        "kind": "区域 / 位置",
        "note": "区域",
        "number": 15
      },
      {
        "id": "catalog-16",
        "name": "谷神星",
        "kind": "天体",
        "note": "",
        "number": 16
      },
      {
        "id": "catalog-17",
        "name": "智神星",
        "kind": "天体",
        "note": "",
        "number": 17
      },
      {
        "id": "catalog-18",
        "name": "婚神星",
        "kind": "天体",
        "note": "",
        "number": 18
      }
    ]
  },
  {
    "id": 3,
    "name": "巨行星王国",
    "nodes": [
      {
        "id": "catalog-19",
        "name": "木星",
        "kind": "天体",
        "note": "",
        "number": 19
      },
      {
        "id": "catalog-20",
        "name": "木卫一",
        "kind": "天体",
        "note": "",
        "number": 20
      },
      {
        "id": "catalog-21",
        "name": "木卫二",
        "kind": "天体",
        "note": "",
        "number": 21
      },
      {
        "id": "catalog-22",
        "name": "木卫三",
        "kind": "天体",
        "note": "",
        "number": 22
      },
      {
        "id": "catalog-23",
        "name": "木卫四",
        "kind": "天体",
        "note": "",
        "number": 23
      },
      {
        "id": "catalog-24",
        "name": "土星",
        "kind": "天体",
        "note": "",
        "number": 24
      },
      {
        "id": "catalog-25",
        "name": "土卫二",
        "kind": "天体",
        "note": "",
        "number": 25
      },
      {
        "id": "catalog-26",
        "name": "土卫六",
        "kind": "天体",
        "note": "",
        "number": 26
      },
      {
        "id": "catalog-27",
        "name": "土卫八",
        "kind": "天体",
        "note": "",
        "number": 27
      },
      {
        "id": "catalog-28",
        "name": "天王星",
        "kind": "天体",
        "note": "",
        "number": 28
      },
      {
        "id": "catalog-29",
        "name": "天卫五",
        "kind": "天体",
        "note": "",
        "number": 29
      },
      {
        "id": "catalog-30",
        "name": "海王星",
        "kind": "天体",
        "note": "",
        "number": 30
      },
      {
        "id": "catalog-31",
        "name": "海卫一",
        "kind": "天体",
        "note": "",
        "number": 31
      }
    ]
  },
  {
    "id": 4,
    "name": "太阳系边疆",
    "nodes": [
      {
        "id": "catalog-32",
        "name": "冥王星",
        "kind": "天体",
        "note": "",
        "number": 32
      },
      {
        "id": "catalog-33",
        "name": "卡戎",
        "kind": "天体",
        "note": "",
        "number": 33
      },
      {
        "id": "catalog-34",
        "name": "妊神星",
        "kind": "天体",
        "note": "",
        "number": 34
      },
      {
        "id": "catalog-35",
        "name": "鸟神星",
        "kind": "天体",
        "note": "",
        "number": 35
      },
      {
        "id": "catalog-36",
        "name": "阋神星",
        "kind": "天体",
        "note": "",
        "number": 36
      },
      {
        "id": "catalog-37",
        "name": "柯伊伯带",
        "kind": "区域 / 位置",
        "note": "区域",
        "number": 37
      },
      {
        "id": "catalog-38",
        "name": "阿罗科思",
        "kind": "天体",
        "note": "",
        "number": 38
      },
      {
        "id": "catalog-39",
        "name": "旅行者 1 号位置",
        "kind": "任务位置",
        "note": "随时间变化",
        "number": 39
      },
      {
        "id": "catalog-40",
        "name": "日球层顶",
        "kind": "区域 / 位置",
        "note": "边界概念",
        "number": 40
      },
      {
        "id": "catalog-41",
        "name": "奥尔特云",
        "kind": "区域 / 位置",
        "note": "推测存在的遥远区域",
        "number": 41
      }
    ]
  },
  {
    "id": 5,
    "name": "恒星邻域",
    "nodes": [
      {
        "id": "catalog-42",
        "name": "比邻星",
        "kind": "天体",
        "note": "",
        "number": 42
      },
      {
        "id": "catalog-43",
        "name": "比邻星 b",
        "kind": "天体",
        "note": "",
        "number": 43
      },
      {
        "id": "catalog-44",
        "name": "南门二 A",
        "kind": "天体",
        "note": "",
        "number": 44
      },
      {
        "id": "catalog-45",
        "name": "南门二 B",
        "kind": "天体",
        "note": "",
        "number": 45
      },
      {
        "id": "catalog-46",
        "name": "巴纳德星",
        "kind": "天体",
        "note": "",
        "number": 46
      },
      {
        "id": "catalog-47",
        "name": "沃尔夫 359",
        "kind": "天体",
        "note": "",
        "number": 47
      },
      {
        "id": "catalog-48",
        "name": "拉兰德 21185",
        "kind": "天体",
        "note": "",
        "number": 48
      },
      {
        "id": "catalog-49",
        "name": "天狼星 A",
        "kind": "天体",
        "note": "",
        "number": 49
      },
      {
        "id": "catalog-50",
        "name": "天狼星 B",
        "kind": "天体",
        "note": "",
        "number": 50
      },
      {
        "id": "catalog-51",
        "name": "罗斯 154",
        "kind": "天体",
        "note": "",
        "number": 51
      }
    ]
  },
  {
    "id": 6,
    "name": "银河深空",
    "nodes": [
      {
        "id": "catalog-52",
        "name": "织女星",
        "kind": "天体",
        "note": "",
        "number": 52
      },
      {
        "id": "catalog-53",
        "name": "参宿四",
        "kind": "天体",
        "note": "",
        "number": 53
      },
      {
        "id": "catalog-54",
        "name": "猎户座大星云",
        "kind": "天体",
        "note": "",
        "number": 54
      },
      {
        "id": "catalog-55",
        "name": "蟹状星云",
        "kind": "天体",
        "note": "",
        "number": 55
      },
      {
        "id": "catalog-56",
        "name": "昴星团",
        "kind": "天体",
        "note": "",
        "number": 56
      },
      {
        "id": "catalog-57",
        "name": "鹰状星云",
        "kind": "天体",
        "note": "",
        "number": 57
      },
      {
        "id": "catalog-58",
        "name": "银河系中心",
        "kind": "区域 / 位置",
        "note": "区域",
        "number": 58
      },
      {
        "id": "catalog-59",
        "name": "人马座 A*",
        "kind": "天体",
        "note": "超大质量黑洞",
        "number": 59
      },
      {
        "id": "catalog-60",
        "name": "大麦哲伦云",
        "kind": "天体",
        "note": "卫星星系",
        "number": 60
      },
      {
        "id": "catalog-61",
        "name": "仙女座星系",
        "kind": "天体",
        "note": "",
        "number": 61
      },
      {
        "id": "catalog-62",
        "name": "三角座星系",
        "kind": "天体",
        "note": "",
        "number": 62
      }
    ]
  }
];
export const supplyStation: CatalogNode = { id: "station", name: "补给空间站", kind: "虚构设施", note: "游戏中的补给站，与国际空间站不同。", number: 0 };

// The atlas and current-stage route share this exact ordered catalog.
export const explorationRegions = spaceRegions.map((region, index) => ({
  ...region,
  nodes: index === 0 ? [region.nodes[0], supplyStation, ...region.nodes.slice(1)] : region.nodes,
}));
export function nextExplorationNode(stationVisited: boolean) {
  return explorationRegions[0].nodes[stationVisited ? 2 : 1];
}
