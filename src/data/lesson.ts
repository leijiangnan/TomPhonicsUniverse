const firstLesson = {
  id: "mission-001",
  title: "失落的能源方块",
  planet: "字母森林星",
  steps: [
    {
      id: "s",
      grapheme: "s",
      ipa: "/s/",
      theme: "mint",
      audio: "/audio/phoneme-s.mp3",
      parentTip:
        "一起模仿小蛇的嘶嘶声。只发 /s/，不要读成字母名称，也不要在后面加「呃」。",
      words: [
        { word: "sun", meaning: "太阳", audio: "/audio/sun.mp3" },
        { word: "snake", meaning: "蛇", audio: "/audio/snake.mp3" },
        { word: "sock", meaning: "袜子", audio: "/audio/sock.mp3" },
      ],
    },
    {
      id: "a",
      grapheme: "a",
      ipa: "/æ/",
      theme: "peach",
      audio: "/audio/phoneme-a.mp3",
      parentTip:
        "先示范 apple 开头的短元音，再请孩子模仿。这里学习的是短 /æ/，不是字母名称 /eɪ/。三个例词都使用美式英语开头的短 /æ/。",
      words: [
        { word: "apple", meaning: "苹果", audio: "/audio/apple.mp3" },
        { word: "ant", meaning: "蚂蚁", audio: "/audio/ant.mp3" },
        { word: "alligator", meaning: "短吻鳄", audio: "/audio/alligator.mp3" },
      ],
    },
    {
      id: "t",
      grapheme: "t",
      ipa: "/t/",
      theme: "lavender",
      audio: "/audio/phoneme-t.mp3",
      parentTip:
        "舌尖轻碰上齿龈，然后短促地放开。发一个轻而短的 /t/，避免在后面加元音，也不要读成字母名称 /tiː/。",
      words: [
        { word: "top", meaning: "陀螺", audio: "/audio/top.mp3" },
        { word: "tiger", meaning: "老虎", audio: "/audio/tiger.mp3" },
        { word: "turtle", meaning: "海龟", audio: "/audio/turtle.mp3" },
      ],
    },
  ],
} as const;

const firstRounds = [
  { word: "at", meaning: "在……", letters: ["t", "a"], audio: "/audio/at.mp3" },
  { word: "sat", meaning: "坐（sit 的过去式）", letters: ["t", "s", "a"], audio: "/audio/sat.mp3" },
] as const;
const firstSpeaking = {
  word: "apple",
  question: "What is it?",
  answer: "It's an apple.",
  questionAudio: "/audio/what-is-it.mp3",
  answerAudio: "/audio/its-an-apple.mp3",
} as const;
export const planets = [
  { id: "forest", name: "字母森林星", activity: "认声音", art: "forest" },
  { id: "dunes", name: "拼读沙丘星", activity: "拼单词", art: "desert" },
  { id: "crystal", name: "对话水晶星", activity: "开口说", art: "ice" },
] as const;
export type PlanetId = (typeof planets)[number]["id"];

export type SoundStep = {
  id: string;
  grapheme: string;
  ipa: string;
  theme: string;
  audio: string;
  parentTip: string;
  words: readonly {
    word: string;
    meaning: string;
    audio: string;
    usageType?: "oral_only";
  }[];
};
export type Lesson = {
  id: string;
  title: string;
  focus: string;
  review?: boolean;
  steps: readonly SoundStep[];
  blendRounds: readonly {
    word: string;
    meaning: string;
    letters: readonly string[];
    audio: string;
    usageType: "decodable";
    requires: readonly string[];
  }[];
  speakingTask: {
    word: string;
    question: string;
    answer: string;
    questionAudio: string;
    answerAudio: string;
    usageType: "oral_only";
  };
};
function sound(
  id: string,
  ipa: string,
  theme: string,
  words: [string, string][],
  parentTip: string,
): SoundStep {
  return {
    id,
    grapheme: id,
    ipa,
    theme,
    parentTip,
    audio: `/audio/phoneme-${id}.mp3`,
    words: words.map(([word, meaning]) => ({
      word,
      meaning,
      audio: `/audio/${word}.mp3`,
      usageType: "oral_only",
    })),
  };
}
function rounds(words: [string, string][]) {
  return words.map(([word, meaning]) => ({
    word,
    meaning,
    letters: [...word].reverse(),
    audio: `/audio/${word}.mp3`,
    usageType: "decodable" as const,
    requires: [...new Set(word)],
  }));
}
function speaking(word: string) {
  return {
    word,
    question: "What is it?",
    answer: `It's a ${word}.`,
    questionAudio: "/audio/what-is-it.mp3",
    answerAudio: `/audio/its-a-${word}.mp3`,
    usageType: "oral_only" as const,
  };
}
function speakingPrompt(
  word: string,
  question: string,
  answer: string,
  questionAudio: string,
  answerAudio: string,
) {
  return {
    word,
    question,
    answer,
    questionAudio,
    answerAudio,
    usageType: "oral_only" as const,
  };
}

const firstSteps: readonly SoundStep[] = firstLesson.steps.map((step) => ({
  ...step,
  words: step.words.map((word) => ({
    ...word,
    usageType: "oral_only" as const,
  })),
}));
const secondSteps = [
  sound(
    "p",
    "/p/",
    "mint",
    [
      ["pig", "小猪"],
      ["pen", "钢笔"],
      ["pan", "平底锅"],
    ],
    "双唇闭合后轻轻放开，短促发 /p/，不要读成字母名称或加元音。",
  ),
  sound(
    "i",
    "/ɪ/",
    "peach",
    [
      ["ink", "墨水"],
      ["insect", "昆虫"],
      ["igloo", "冰屋"],
    ],
    "示范 ink 开头的短 /ɪ/，不是字母名称 /aɪ/。三个例词均以短 /ɪ/ 开头。",
  ),
  sound(
    "n",
    "/n/",
    "lavender",
    [
      ["net", "网"],
      ["nest", "鸟巢"],
      ["nut", "坚果"],
    ],
    "舌尖抵上齿龈，让声音从鼻腔出来，发 /n/，不要附加元音。",
  ),
] as const;
const thirdSteps = [
  sound(
    "m",
    "/m/",
    "mint",
    [
      ["map", "地图"],
      ["moon", "月亮"],
      ["mouse", "老鼠"],
    ],
    "合上双唇，轻轻哼出 /m/，感受鼻腔振动，不要读成字母名称。",
  ),
  sound(
    "d",
    "/d/",
    "peach",
    [
      ["dog", "小狗"],
      ["duck", "鸭子"],
      ["dinosaur", "恐龙"],
    ],
    "舌尖轻碰上齿龈后放开，声带振动，短促发 /d/，避免附加元音。",
  ),
] as const;
const fifthSteps = [
  sound(
    "o",
    "/ɑ/",
    "mint",
    [
      ["octopus", "章鱼"],
      ["ox", "公牛"],
      ["olive", "橄榄"],
    ],
    "示范 octopus 开头的美式短 o /ɑ/，嘴巴自然张开；不要读成字母名称 /oʊ/。",
  ),
  sound(
    "c",
    "/k/",
    "peach",
    [
      ["cat", "小猫"],
      ["cup", "杯子"],
      ["car", "汽车"],
    ],
    "这里学习 c 在 cat 中的 /k/ 音。舌后部轻触软腭后快速放开，不要附加元音。",
  ),
  sound(
    "k",
    "/k/",
    "lavender",
    [
      ["key", "钥匙"],
      ["kite", "风筝"],
      ["king", "国王"],
    ],
    "k 也可以表示 /k/。发音短促，不要读成字母名称 /keɪ/，也不要在后面加元音。",
  ),
] as const;
const sixthSteps = [
  sound(
    "e",
    "/ɛ/",
    "mint",
    [
      ["egg", "鸡蛋"],
      ["elephant", "大象"],
      ["elbow", "手肘"],
    ],
    "示范 egg 开头的短 /ɛ/，嘴角自然放松；不要读成字母名称 /iː/。",
  ),
  sound(
    "h",
    "/h/",
    "peach",
    [
      ["hat", "帽子"],
      ["hand", "手"],
      ["horse", "马"],
    ],
    "像轻轻哈气一样发 /h/，只送出气流，不要读成字母名称或加元音。",
  ),
  sound(
    "r",
    "/r/",
    "lavender",
    [
      ["rabbit", "兔子"],
      ["robot", "机器人"],
      ["rain", "雨"],
    ],
    "舌尖抬起但不要碰到上颚，嘴唇略收圆，发美式 /r/，不要读成字母名称。",
  ),
] as const;
const seventhSteps = [
  sound(
    "b",
    "/b/",
    "mint",
    [
      ["ball", "球"],
      ["bed", "床"],
      ["bus", "公交车"],
    ],
    "双唇闭合后短促放开，同时让声带振动，发 /b/，不要附加元音。",
  ),
  sound(
    "g",
    "/ɡ/",
    "peach",
    [
      ["goat", "山羊"],
      ["gift", "礼物"],
      ["gum", "口香糖"],
    ],
    "这里学习 g 在 goat 中的 /ɡ/ 音。舌后部轻触软腭后放开，声带振动。",
  ),
  sound(
    "u",
    "/ʌ/",
    "lavender",
    [
      ["umbrella", "雨伞"],
      ["up", "向上"],
      ["uncle", "叔叔"],
    ],
    "示范 umbrella 开头的短 /ʌ/，嘴巴放松、声音短促；不要读成字母名称 /juː/。",
  ),
] as const;
const firstEightSteps = [...firstSteps, ...secondSteps, ...thirdSteps];
const firstUnitSteps = [
  ...firstEightSteps,
  ...fifthSteps,
  ...sixthSteps,
  ...seventhSteps,
];

export const lessons: readonly Lesson[] = [
  {
    ...firstLesson,
    focus: "s · a · t",
    steps: firstSteps,
    blendRounds: firstRounds.map((round) => ({
      ...round,
      usageType: "decodable" as const,
      requires: [...round.word],
    })),
    speakingTask: { ...firstSpeaking, usageType: "oral_only" },
  },
  {
    id: "mission-002",
    title: "新的字母能源",
    focus: "p · i · n",
    steps: secondSteps,
    blendRounds: rounds([["pin", "大头针"], ["sit", "坐"], ["tap", "轻敲"]]),
    speakingTask: speaking("pig"),
  },
  {
    id: "mission-003",
    title: "找到探险地图",
    focus: "m · d",
    steps: thirdSteps,
    blendRounds: rounds([["map", "地图"], ["mad", "生气的"], ["dip", "蘸一下"]]),
    speakingTask: speaking("map"),
  },
  {
    id: "mission-004",
    title: "声音寻宝",
    focus: "复习前 8 个字母音",
    review: true,
    steps: firstEightSteps,
    blendRounds: rounds([
      ["map", "地图"],
      ["pin", "大头针"],
      ["pan", "平底锅"],
      ["mat", "垫子"],
    ]),
    speakingTask: speakingPrompt(
      "map",
      "What do you see?",
      "I see a map.",
      "/audio/what-do-you-see.mp3",
      "/audio/i-see-a-map.mp3",
    ),
  },
  {
    id: "mission-005",
    title: "收集字母矿石",
    focus: "o · c · k",
    steps: fifthSteps,
    blendRounds: rounds([["cot", "小床"], ["cop", "警察"], ["kid", "孩子"]]),
    speakingTask: speakingPrompt(
      "cat",
      "What do you see?",
      "I see a cat.",
      "/audio/what-do-you-see.mp3",
      "/audio/i-see-a-cat.mp3",
    ),
  },
  {
    id: "mission-006",
    title: "给机器人送物资",
    focus: "e · h · r",
    steps: sixthSteps,
    blendRounds: rounds([["hen", "母鸡"], ["red", "红色的"], ["pet", "宠物"]]),
    speakingTask: speakingPrompt(
      "hen",
      "What do you like?",
      "I like the hen.",
      "/audio/what-do-you-like.mp3",
      "/audio/i-like-the-hen.mp3",
    ),
  },
  {
    id: "mission-007",
    title: "合成起飞工具",
    focus: "b · g · u",
    steps: seventhSteps,
    blendRounds: rounds([["bug", "小虫"], ["big", "大的"], ["mug", "马克杯"]]),
    speakingTask: speakingPrompt(
      "bug",
      "Is it big or small?",
      "It's a big bug.",
      "/audio/is-it-big-or-small.mp3",
      "/audio/its-a-big-bug.mp3",
    ),
  },
  {
    id: "mission-008",
    title: "飞船起飞挑战",
    focus: "字母启航总复习",
    review: true,
    steps: firstUnitSteps,
    blendRounds: rounds([
      ["cat", "小猫"],
      ["dog", "小狗"],
      ["mug", "马克杯"],
      ["hat", "帽子"],
      ["bed", "床"],
      ["map", "地图"],
      ["sun", "太阳"],
      ["rug", "地毯"],
    ]),
    speakingTask: speakingPrompt(
      "bug",
      "What do you see?",
      "I see a red bug.",
      "/audio/what-do-you-see.mp3",
      "/audio/i-see-a-red-bug.mp3",
    ),
  },
];
export const courseUnits = [
  {
    name: "字母启航",
    topics: [
      "s · a · t",
      "p · i · n",
      "m · d",
      "复习 8 个字母音",
      "o · c · k",
      "e · h · r",
      "b · g · u",
      "阶段复习",
    ],
  },
  {
    name: "单词矿场",
    topics: [
      "f · l",
      "w · j",
      "v · z",
      "x · y · qu",
      "短元音 a / i",
      "短元音 o / u / e",
      "辅音连缀入门",
      "综合复习",
    ],
  },
  {
    name: "冰雪遗迹",
    topics: Array.from({ length: 8 }, (_, i) =>
      i < 4 ? "辅音连缀与双写" : "辅音字母组合",
    ),
  },
  {
    name: "魔法之星",
    topics: Array.from({ length: 8 }, (_, i) =>
      i < 4 ? "Magic E" : "常见长元音组合",
    ),
  },
  {
    name: "海洋秘境",
    topics: Array.from({ length: 8 }, (_, i) =>
      i < 4 ? "r 控制元音" : "其他元音组合",
    ),
  },
  {
    name: "银河空间站",
    topics: Array.from({ length: 8 }, (_, i) =>
      i < 4 ? "句子与短篇阅读" : "综合复习与表达",
    ),
  },
];
// Compatibility exports for first-lesson consumers; new pages select by lessonIndex.
export const lesson = lessons[0];
export const STEP_COUNT = lesson.steps.length;
export const blendRounds = lesson.blendRounds;
export const speakingTask = lesson.speakingTask;
