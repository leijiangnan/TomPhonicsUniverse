export type NodeImage = {
  src: string; kind: string; caption: string; credit: string; source: string; license: string;
};

// Original download URLs and research records live in
// artifacts/science-research/images.json. The site loads only local image files.
const images: Record<string, NodeImage> = {
  "0": {
    "source": "https://commons.wikimedia.org/wiki/File:SpaceX_CRS-4_Dragon.jpg",
    "kind": "补给飞船实拍",
    "credit": "NASA / Expedition 41",
    "caption": "执行 CRS-4（SpX-4）任务的 SpaceX 龙飞船，为国际空间站运送补给。这张真实照片供游戏补给站参考，飞船本身不是空间站。",
    "src": "/space-images/0.jpg",
    "license": "公有领域（NASA）；使用用户提供的图片，未修改"
  },
  "8": {
    "source": "https://commons.wikimedia.org/wiki/File:PIA23791-Venus-RealAndEnhancedContrastViews-20200608_(cropped1).jpg",
    "kind": "航天器观测图像",
    "credit": "NASA / JPL-Caltech；图像处理：Kevin M. Gill",
    "caption": "水手 10 号拍摄的金星。厚厚的云层遮住了地表；这是经过处理的近自然色合成图。",
    "src": "/space-images/8.jpg",
    "license": "NASA 媒体使用指南；NASA / JPL-Caltech 署名保留"
  },
  "9": {
    "source": "https://science.nasa.gov/mercury/facts/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Gray planet Mercury with craters and rays of material ejected by impactors like asteroids.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/9.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "11": {
    "source": "https://science.nasa.gov/mars/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "A view of Mars showing a large crater across the middle of the red planet.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/11.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "12": {
    "source": "https://science.nasa.gov/mars/moons/phobos/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Phobos is Mars' largest moon.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/12.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "13": {
    "source": "https://science.nasa.gov/mars/moons/deimos/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Deimos is the smaller of the two Martian moons and is less irregular in shape.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/13.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "14": {
    "source": "https://science.nasa.gov/solar-system/asteroids/4-vesta/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Roundish asteroid in space。可能包含拼接、配色或图像处理。",
    "src": "/space-images/14.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "16": {
    "source": "https://science.nasa.gov/resource/high-resolution-ceres-view/",
    "kind": "航天器观测图像",
    "credit": "NASA / JPL-Caltech / UCLA / MPS / DLR / IDA",
    "caption": "黎明号探测器拍摄的谷神星正射投影图，含拼接与图像处理。",
    "src": "/space-images/16.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "19": {
    "source": "https://science.nasa.gov/photojournal/jupiter-marble/",
    "kind": "观测图像",
    "credit": "NASA / JPL-Caltech / SwRI / MSSS；Kevin M. Gill 处理，CC BY 3.0",
    "caption": "朱诺号数据制作的木星图像，Kevin M. Gill 进行增强处理，含拼接与色彩处理。",
    "src": "/space-images/19.jpg",
    "license": "CC BY 3.0"
  },
  "20": {
    "source": "https://science.nasa.gov/jupiter/moons/io/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "A rust-colored sphere is shown against a black background. The left half is concealed in shadow, with only a very dim outline visible. The right half is fairly well-lighted, with the surface smooth in some areas and in others covered with splotches and peaks of light tan, or spots and dimples of dark orange or dark grayish brown.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/20.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "21": {
    "source": "https://science.nasa.gov/jupiter/moons/europa/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "A semi-circular view of Europa, with its light blue and brown surface marked with brown lines.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/21.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "22": {
    "source": "https://science.nasa.gov/jupiter/moons/ganymede/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "A half-globe view of Jupiter's moon, Ganymede. The moon is gray with a big crater on the right side of the image. The moon also has streaks of lighter and darker materials.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/22.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "23": {
    "source": "https://science.nasa.gov/jupiter/moons/callisto/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Bright scars on a darker surface testify to a long history of impacts on Jupiter's moon Callisto in this image of Callisto from NASA's Galileo spacecraft.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/23.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "24": {
    "source": "https://science.nasa.gov/saturn/facts/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "A spacecraft looks down on a soft gold-colored Saturn surrounded by its rings.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/24.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "25": {
    "source": "https://science.nasa.gov/saturn/moons/enceladus/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Saturn’s moon Encedalus sends out regular plumes of water vapor — seen here in an image from the Cassini spacecraft — that are known to contain complex organic molecules.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/25.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "26": {
    "source": "https://science.nasa.gov/saturn/moons/titan/facts/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "The colorful globe of Saturn's largest moon, Titan, passes in front of the planet and its rings in this true color snapshot from NASA's Cassini spacecraft.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/26.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "28": {
    "source": "https://science.nasa.gov/uranus/facts/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Pale blue planet Uranus is seen against the darkness of space in an image from the Voyager 2 spacecraft.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/28.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "29": {
    "source": "https://science.nasa.gov/uranus/moons/miranda/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Miranda's Geologic History。可能包含拼接、配色或图像处理。",
    "src": "/space-images/29.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "30": {
    "source": "https://science.nasa.gov/neptune/facts/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Neptune is blue and banded with clouds and storms.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/30.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "31": {
    "source": "https://science.nasa.gov/neptune/moons/triton/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Global color mosaic of Triton, taken in 1989 by Voyager 2 during its flyby of the Neptune system.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/31.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "32": {
    "source": "https://science.nasa.gov/dwarf-planets/pluto/facts/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Pluto is reddish and has a heart shape lighter patch in the lower right half of this image from the New Horizons spacecraft.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/32.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "33": {
    "source": "https://science.nasa.gov/dwarf-planets/pluto/moons/charon/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "A full glove view of Pluton's moon, Charon. The moon is gray with a reddish cap.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/33.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "35": {
    "source": "https://science.nasa.gov/dwarf-planets/makemake/",
    "kind": "望远镜观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Makemake moon。可能包含拼接、配色或图像处理。",
    "src": "/space-images/35.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "36": {
    "source": "https://science.nasa.gov/dwarf-planets/eris/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "These time-lapse images of a newfound dwarf planet in our solar system, formerly known as 2003 UB313 or Xena, and now called Eris, were taken using the Samuel Oschin Telescope at the Palomar Observatory.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/36.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "37": {
    "source": "https://science.nasa.gov/solar-system/kuiper-belt/facts/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Hubble Images of Kuiper Belt Objects。可能包含拼接、配色或图像处理。",
    "src": "/space-images/37.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "41": {
    "source": "",
    "kind": "科学示意图",
    "credit": "用户提供（原作者未确认）",
    "caption": "太阳系外围示意图，标出太阳、木星、海王星、柯伊伯带和奥尔特云。奥尔特云被推测为包围太阳系的近球状区域；图中距离不按比例，这不是实拍照片。",
    "src": "/space-images/41.jpg",
    "license": "原始来源与许可待确认；用户提供的 PNG 已转换为 JPEG"
  },
  "42": {
    "source": "",
    "kind": "科学示意图",
    "credit": "用户提供（原作者未确认）",
    "caption": "太阳附近恒星距离示意图，标出奥尔特云、比邻星、南门二 A&B、巴纳德星和沃尔夫 359 等位置。图中距离用于帮助理解相对远近，不是实拍照片，也不是精确比例图。",
    "src": "/space-images/42.jpg",
    "license": "原始来源与许可待确认；用户提供的 PNG 已转换为 JPEG"
  },
  "44": {
    "source": "",
    "kind": "科学示意图",
    "credit": "用户提供（原作者未确认）",
    "caption": "太阳附近恒星距离示意图，标出南门二 A、南门二 B、比邻星、奥尔特云和太阳的位置关系。图中距离用于帮助理解相对远近，不是实拍照片，也不是精确比例图。",
    "src": "/space-images/44.jpg",
    "license": "原始来源与许可待确认；用户提供的 PNG 已转换为 JPEG"
  },
  "54": {
    "source": "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-42/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Orion Nebula。可能包含拼接、配色或图像处理。",
    "src": "/space-images/54.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "55": {
    "source": "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-1/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Crab Nebula。可能包含拼接、配色或图像处理。",
    "src": "/space-images/55.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "56": {
    "source": "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-45/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "interstellar cloud in Pleiades。可能包含拼接、配色或图像处理。",
    "src": "/space-images/56.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "57": {
    "source": "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-16/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "The famous Pillars of Creation revealed by the Hubble Space Telescope.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/57.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "61": {
    "source": "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-31/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "The Andromeda galaxy, a spiral galaxy, spreads across the width. It is tilted nearly edge-on to our line of sight so that it appears as an extreme oval on its side. The borders of the galaxy are jagged because the image is a mosaic of smaller, square images. The outer edges are blue, while the inner two-thirds are yellowish with a bright, central core. Dark, dusty filamentary clouds wrap around the outer half of the galaxy’s disk. At 10 o'clock, a smaller dwarf elliptical galaxy forms a fuzzy, yellow blob. Hubble's sharp vision distinguishes about 200 million stars within the image. The background of space is black. There are what appears to be steps toward the bottom, mainly toward the middle, which indicates where no data were taken.。可能包含拼接、配色或图像处理。",
    "src": "/space-images/61.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "62": {
    "source": "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-33/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "Hubble image of M33。可能包含拼接、配色或图像处理。",
    "src": "/space-images/62.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "1": {
    "source": "https://commons.wikimedia.org/wiki/File:The_Earth_seen_from_Apollo_17.jpg",
    "kind": "真实照片",
    "credit": "NASA / 阿波罗 17 号乘组",
    "caption": "阿波罗 17 号乘组在 1972 年拍摄的「蓝色弹珠」。画面里能看到非洲、海洋和白色云层。",
    "src": "/space-images/1.jpg",
    "license": "公有领域（NASA）；本地版本缩小尺寸并重新编码"
  },
  "2": {
    "source": "https://commons.wikimedia.org/wiki/File:International_Space_Station_after_undocking_of_STS-132.jpg",
    "kind": "真实照片",
    "credit": "NASA / STS-132 乘组",
    "caption": "2010 年，亚特兰蒂斯号航天飞机离站后拍摄的国际空间站。两侧是太阳能板，下方是地球。",
    "src": "/space-images/2.jpg",
    "license": "公有领域（NASA）；本地版本缩小尺寸并重新编码"
  },
  "3": {
    "source": "https://commons.wikimedia.org/wiki/File:FullMoon2010.jpg",
    "kind": "望远镜实拍",
    "credit": "Gregory H. Revera · CC BY-SA 3.0",
    "caption": "从地球拍摄的满月。较暗的区域叫月海，明亮的区域能看到撞击坑；原图叠加了多次拍摄以减少噪点。",
    "src": "/space-images/3.jpg",
    "license": "CC BY-SA 3.0（https://creativecommons.org/licenses/by-sa/3.0/）；本地版本缩小尺寸并重新编码，沿用相同许可"
  },
  "4": {
    "source": "https://commons.wikimedia.org/wiki/File:Moon_Farside_LRO.jpg",
    "kind": "航天器观测拼接图",
    "credit": "NASA / GSFC / Arizona State University",
    "caption": "月球勘测轨道飞行器（LRO）拍摄并拼接的月球背面全貌。这里布满撞击坑，也会受到太阳照亮。",
    "src": "/space-images/4.jpg",
    "license": "公有领域（NASA）；本地版本缩小尺寸并重新编码"
  },
  "5": {
    "source": "https://commons.wikimedia.org/wiki/File:Points_Lagrange_Lune-Terre.jpg",
    "kind": "科学位置示意图",
    "credit": "David A. Kring / LPI-JSC Center for Lunar Science and Exploration",
    "caption": "地月系统的五个拉格朗日点。L2 在月球背向地球的一侧；线条表示位置关系，这不是太空照片，大小也不按比例。",
    "src": "/space-images/5.jpg",
    "license": "公有领域；本地版本重新编码"
  },
  "6": {
    "source": "https://www.nasa.gov/missions/artemis/gateway-tops-off/",
    "kind": "艺术家概念图",
    "credit": "NASA / Alberto Bertolin",
    "caption": "NASA 发布的 Gateway 月球空间站概念图，供游戏月球轨道站参考。这不是已经建成的空间站照片。",
    "src": "/space-images/6.jpg",
    "license": "NASA 媒体使用指南；保留 NASA / Alberto Bertolin 署名；本地版本缩小尺寸并重新编码"
  },
  "7": {
    "source": "https://commons.wikimedia.org/wiki/File:SOLAR_DYNAMICS_OBSERVATORY_(SDO)_BEAUTY_SHOTS-SDO_SPACECRAFT_-_DPLA_-_09df9ed1c3f1a54e2372e93664fb790e.jpg",
    "kind": "探测器地面实拍",
    "credit": "NASA / GSFC / Pat Izzo",
    "caption": "太阳动力学天文台（SDO）探测器在发射前的洁净室照片，供游戏太阳观测站参考；这不是在太阳上建造的设施。",
    "src": "/space-images/7.jpg",
    "license": "公有领域（NASA）；本地版本缩小尺寸并重新编码"
  },
  "15": {
    "source": "https://images.nasa.gov/details/PIA19380",
    "kind": "示意图",
    "credit": "NASA / JPL-Caltech",
    "caption": "小行星带示意图，不是把整片区域拍入一张照片。",
    "src": "/space-images/15.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "17": {
    "source": "https://www.eso.org/public/images/potw2008a/",
    "kind": "观测图像",
    "credit": "ESO / P. Vernazza",
    "caption": "智神星观测图。",
    "src": "/space-images/17.jpg",
    "license": "ESO 素材许可，详见来源页"
  },
  "18": {
    "source": "https://commons.wikimedia.org/wiki/File:3_Juno_VLT_(2021).png",
    "kind": "望远镜观测图像",
    "credit": "VSO Very Large Telescope SPHERE/ZIMPOL team；CC BY-SA 4.0",
    "caption": "VLT/SPHERE 观测并处理的婚神星图像。",
    "src": "/space-images/18.jpg",
    "license": "CC BY-SA 4.0"
  },
  "27": {
    "source": "https://images.nasa.gov/details/PIA02268",
    "kind": "观测图像",
    "credit": "NASA / JPL / Space Science Institute",
    "caption": "土卫八观测图。",
    "src": "/space-images/27.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "34": {
    "source": "https://science.nasa.gov/solar-system/planet-sizes-and-locations-in-our-solar-system/",
    "kind": "望远镜观测图像",
    "credit": "NASA / ESA / D. Ragozzine；Gladys Kober 处理",
    "caption": "哈勃望远镜观测到的妊神星和两颗卫星，目标只是光点，不能看清表面。",
    "src": "/space-images/34.jpg",
    "license": "NASA / ESA 媒体使用条款与署名，详见来源页"
  },
  "38": {
    "source": "https://images.nasa.gov/details/PIA22480",
    "kind": "观测图像",
    "credit": "NASA / JHUAPL / SwRI",
    "caption": "新视野号拍摄的阿罗科思。",
    "src": "/space-images/38.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "39": {
    "source": "https://images.nasa.gov/details/PIA21740",
    "kind": "航天器照片",
    "credit": "NASA / JPL-Caltech",
    "caption": "旅行者 1 号发射照片，并非当前位置照片。",
    "src": "/space-images/39.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "40": {
    "source": "https://science.nasa.gov/heliophysics/focus-areas/heliosphere/",
    "kind": "科学示意图",
    "credit": "NASA",
    "caption": "日球层及边界示意图，不是空间边界的实拍。",
    "src": "/space-images/40.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "43": {
    "source": "",
    "kind": "艺术家想象图",
    "credit": "用户提供（原作者未确认）",
    "caption": "比邻星 b 的轨道关系想象图，标出比邻星、行星轨道和可能的潮汐锁定状态。比邻星 b 目前没有表面实拍，这不是实拍照片；图中天体大小和距离不是精确比例。",
    "src": "/space-images/43.jpg",
    "license": "原始来源与许可待确认；用户提供的 PNG 已转换为 JPEG"
  },
  "49": {
    "source": "",
    "kind": "科学示意图",
    "credit": "用户提供（原作者未确认）",
    "caption": "天狼星 A 的天空位置示意图，标出太犬座、猎户座腰带和天狼星之间的寻找线索。这不是实拍照片，也不是天狼星表面图或精确比例图。",
    "src": "/space-images/49.jpg",
    "license": "原始来源与许可待确认；用户提供的 PNG 已转换为 JPEG"
  },
  "50": {
    "source": "https://esahubble.org/images/heic0516a/",
    "kind": "望远镜观测图像",
    "credit": "NASA / ESA / Hubble",
    "caption": "天狼星 B 是明亮天狼星 A 附近的暗弱亮点；本图不是它的表面近照。",
    "src": "/space-images/50.jpg",
    "license": "NASA / ESA 媒体使用条款与署名，详见来源页"
  },
  "52": {
    "source": "",
    "kind": "科学示意图",
    "credit": "用户提供（原作者未确认）",
    "caption": "织女星与太阳的大小对比示意图，用于展示织女星比太阳更大、更亮。这不是实拍照片，也不是精确比例图。",
    "src": "/space-images/52.jpg",
    "license": "原始来源与许可待确认；用户提供的 PNG 已转换为 JPEG"
  },
  "53": {
    "source": "https://science.nasa.gov/universe/what-is-betelgeuse-inside-the-strange-volatile-star/",
    "kind": "观测图像",
    "credit": "NASA / STEREO",
    "caption": "参宿四在观测图中是一个亮点。",
    "src": "/space-images/53.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "58": {
    "source": "https://images.nasa.gov/details/PIA17009",
    "kind": "观测图像",
    "credit": "NASA / JPL-Caltech / Spitzer",
    "caption": "银河系中心方向的红外观测图。",
    "src": "/space-images/58.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "59": {
    "source": "https://images.nasa.gov/details/PIA03653",
    "kind": "相关区域观测图",
    "credit": "NASA / JPL-Caltech",
    "caption": "银河系中心方向的观测图，不是黑洞本体照片。",
    "src": "/space-images/59.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "60": {
    "source": "https://images.nasa.gov/details/iss071e418742",
    "kind": "真实照片",
    "credit": "NASA",
    "caption": "从空间站拍摄的大、小麦哲伦云。",
    "src": "/space-images/60.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "45": {
    "source": "https://science.nasa.gov/missions/hubble/hubbles-best-image-of-alpha-centauri-a-and-b/",
    "kind": "观测图像",
    "credit": "NASA / 合作机构；详见来源页",
    "caption": "南门二 A 与 B 的双星观测图，右侧较暗的是南门二 B；不能据此看到恒星表面。",
    "src": "/space-images/45.jpg",
    "license": "NASA 媒体使用指南；合作方权利与署名详见来源页"
  },
  "46": {
    "source": "",
    "kind": "艺术家想象图",
    "credit": "用户提供（原作者未确认）",
    "caption": "巴纳德星的恒星外观想象图，用暖色表现红矮星和周围光晕。巴纳德星在望远镜观测中通常只是一个光点，这不是实拍照片，也不是精确表面图。",
    "src": "/space-images/46.jpg",
    "license": "原始来源与许可待确认；用户提供的 PNG 已转换为 JPEG"
  },
  "47": {
    "source": "",
    "kind": "艺术家想象图",
    "credit": "用户提供（原作者未确认）",
    "caption": "沃尔夫 359 的恒星外观想象图，用红色表现红矮星和周围光晕。沃尔夫 359 很暗，望远镜观测中通常只是一个光点；这不是实拍照片，也不是精确表面图。",
    "src": "/space-images/47.jpg",
    "license": "原始来源与许可待确认；用户提供的 PNG 已转换为 JPEG"
  },
  "48": {
    "source": "",
    "kind": "艺术家想象图",
    "credit": "用户提供（原作者未确认）",
    "caption": "拉兰德 21185 的恒星外观想象图，用红色表现红矮星，并加入可能行星的剪影。拉兰德 21185 在望远镜观测中通常只是一个光点；这不是实拍照片，也不是精确表面图。",
    "src": "/space-images/48.jpg",
    "license": "原始来源与许可待确认；用户提供的 PNG 已转换为 JPEG"
  },
  "51": {
    "source": "",
    "kind": "艺术家想象图",
    "credit": "用户提供（原作者未确认）",
    "caption": "罗斯 154 的恒星外观想象图，用橙红色表现红矮星表面和明亮活动区。罗斯 154 是会爆发耀斑的红矮星；这不是实拍照片，也不是精确表面图。",
    "src": "/space-images/51.jpg",
    "license": "原始来源与许可待确认；用户提供的 PNG 已转换为 JPEG"
  }
};

export function getNodeImage(number: number) { return images[String(number)]; }
