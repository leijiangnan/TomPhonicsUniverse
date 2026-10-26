export type ReviewSceneId = "crash-cabin" | "launch-check";

export type ReviewSceneItem = {
  id: string;
  word: string;
  meaning: string;
  x: number;
  y: number;
  size?: "small" | "medium" | "large";
};

export type ReviewSoundTarget = {
  soundId: string;
  itemId: string;
};

export type ReviewDialogueLine = {
  npc: string;
  npcMeaning: string;
  reply: string;
  replyMeaning: string;
  npcAudio: string;
  replyAudio: string;
  focusItemId: string;
};

export type ReviewUnit = {
  lessonId: "mission-004" | "mission-008";
  sceneId: ReviewSceneId;
  sceneTitle: string;
  soundBatches: readonly {
    items: readonly ReviewSceneItem[];
    targets: readonly ReviewSoundTarget[];
  }[];
  placementItems: readonly ReviewSceneItem[];
  placementBatches: readonly (readonly string[])[];
  dialogue: readonly ReviewDialogueLine[];
  legacyBlendRoundCount: number;
};

function item(
  id: string,
  word: string,
  meaning: string,
  x: number,
  y: number,
  size: ReviewSceneItem["size"] = "medium",
): ReviewSceneItem {
  return { id, word, meaning, x, y, size };
}

const firstSoundItems = [
  item("sound-sun", "sun", "太阳", 10, 17),
  item("sound-apple", "apple", "苹果", 36, 16),
  item("sound-top", "top", "陀螺", 68, 17),
  item("sound-pig", "pig", "小猪", 18, 45),
  item("sound-ink", "ink", "墨水", 47, 43),
  item("sound-net", "net", "网", 75, 44),
  item("sound-map", "map", "地图", 31, 70),
  item("sound-dog", "dog", "小狗", 64, 69),
] as const;

const secondSoundItems = [
  item("sound-ox", "ox", "公牛", 8, 16),
  item("sound-cat", "cat", "小猫", 36, 15),
  item("sound-key", "key", "钥匙", 68, 16),
  item("sound-egg", "egg", "鸡蛋", 9, 45),
  item("sound-hat", "hat", "帽子", 38, 43),
  item("sound-rabbit", "rabbit", "兔子", 69, 43),
  item("sound-ball", "ball", "球", 11, 70),
  item("sound-goat", "goat", "山羊", 42, 69),
  item("sound-umbrella", "umbrella", "雨伞", 72, 69),
] as const;

const lesson4PlacementItems = [
  item("place-map", "map", "地图", 10, 22, "large"),
  item("place-pin", "pin", "大头针", 62, 18),
  item("place-pan", "pan", "平底锅", 64, 61, "large"),
  item("place-mat", "mat", "垫子", 18, 66, "large"),
] as const;

const lesson8PlacementItems = [
  item("place-cat", "cat", "小猫", 12, 32),
  item("place-map", "map", "地图", 35, 27, "large"),
  item("place-sun", "sun", "太阳", 60, 25),
  item("place-hat", "hat", "帽子", 84, 30),
  item("place-bed", "bed", "床", 12, 72, "large"),
  item("place-rug", "rug", "地毯", 37, 72, "large"),
  item("place-dog", "dog", "小狗", 62, 72),
  item("place-mug", "mug", "马克杯", 85, 72),
] as const;

export const reviewUnits: Record<ReviewUnit["lessonId"], ReviewUnit> = {
  "mission-004": {
    lessonId: "mission-004",
    sceneId: "crash-cabin",
    sceneTitle: "迫降舱整理",
    soundBatches: [
      {
        items: firstSoundItems,
        targets: [
          { soundId: "s", itemId: "sound-sun" },
          { soundId: "a", itemId: "sound-apple" },
          { soundId: "t", itemId: "sound-top" },
          { soundId: "p", itemId: "sound-pig" },
          { soundId: "i", itemId: "sound-ink" },
          { soundId: "n", itemId: "sound-net" },
          { soundId: "m", itemId: "sound-map" },
          { soundId: "d", itemId: "sound-dog" },
        ],
      },
    ],
    placementItems: lesson4PlacementItems,
    placementBatches: [["map", "pin", "pan", "mat"]],
    dialogue: [
      {
        npc: "What do you see?",
        npcMeaning: "你看到了什么？",
        reply: "I see a map.",
        replyMeaning: "我看到一张地图。",
        npcAudio: "/audio/what-do-you-see.mp3",
        replyAudio: "/audio/i-see-a-map.mp3",
        focusItemId: "place-map",
      },
    ],
    legacyBlendRoundCount: 3,
  },
  "mission-008": {
    lessonId: "mission-008",
    sceneId: "launch-check",
    sceneTitle: "飞船起飞前检查",
    soundBatches: [
      {
        items: firstSoundItems,
        targets: [
          { soundId: "s", itemId: "sound-sun" },
          { soundId: "a", itemId: "sound-apple" },
          { soundId: "t", itemId: "sound-top" },
          { soundId: "p", itemId: "sound-pig" },
          { soundId: "i", itemId: "sound-ink" },
          { soundId: "n", itemId: "sound-net" },
          { soundId: "m", itemId: "sound-map" },
          { soundId: "d", itemId: "sound-dog" },
        ],
      },
      {
        items: secondSoundItems,
        targets: [
          { soundId: "o", itemId: "sound-ox" },
          { soundId: "c", itemId: "sound-cat" },
          { soundId: "k", itemId: "sound-key" },
          { soundId: "e", itemId: "sound-egg" },
          { soundId: "h", itemId: "sound-hat" },
          { soundId: "r", itemId: "sound-rabbit" },
          { soundId: "b", itemId: "sound-ball" },
          { soundId: "g", itemId: "sound-goat" },
          { soundId: "u", itemId: "sound-umbrella" },
        ],
      },
    ],
    placementItems: lesson8PlacementItems,
    placementBatches: [
      ["cat", "dog", "mug", "hat"],
      ["bed", "map", "sun", "rug"],
    ],
    dialogue: [
      {
        npc: "What do you see?",
        npcMeaning: "你看到了什么？",
        reply: "I see a cat.",
        replyMeaning: "我看到一只小猫。",
        npcAudio: "/audio/what-do-you-see.mp3",
        replyAudio: "/audio/i-see-a-cat.mp3",
        focusItemId: "place-cat",
      },
      {
        npc: "Where is the map?",
        npcMeaning: "地图在哪里？",
        reply: "It's on the screen.",
        replyMeaning: "它在屏幕上。",
        npcAudio: "/audio/where-is-the-map.mp3",
        replyAudio: "/audio/its-on-the-screen.mp3",
        focusItemId: "place-map",
      },
      {
        npc: "Are we ready?",
        npcMeaning: "我们准备好了吗？",
        reply: "Yes, let's go!",
        replyMeaning: "是的，我们出发吧！",
        npcAudio: "/audio/are-we-ready.mp3",
        replyAudio: "/audio/yes-lets-go.mp3",
        focusItemId: "place-map",
      },
    ],
    legacyBlendRoundCount: 4,
  },
};

export function reviewForLesson(lessonId: string): ReviewUnit | undefined {
  return reviewUnits[lessonId as ReviewUnit["lessonId"]];
}
