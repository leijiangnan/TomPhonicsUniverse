export type ShopItem = "apple" | "gem";
export type NodeId =
  "greeting" | "request" | "thanks" | "goodbye" | "completed";
export const clip = (id: string) => `/audio/shop/${id}.mp3`;
export const shopItems = {
  apple: {
    label: "苹果",
    sentence: "I want an apple, please.",
    keyword: "an apple",
    audio: clip("want-apple"),
  },
  gem: {
    label: "宝石",
    sentence: "I want a gem, please.",
    keyword: "a gem",
    audio: clip("want-gem"),
  },
};
export const shopNodes = {
  greeting: {
    title: "打个招呼，买份飞船补给",
    npc: "Hello! Welcome to my shop!",
    audio: clip("welcome"),
    answer: "Hello!",
    keyword: "Hello",
    model: clip("hello"),
    next: "request",
  },
  request: {
    title: "买一份补给",
    npc: "What do you want?",
    audio: clip("want"),
    answer: "",
    keyword: "I want…",
    model: "",
    next: "thanks",
  },
  thanks: {
    title: "谢谢店主",
    npc: "",
    audio: "",
    answer: "Thank you!",
    keyword: "Thank",
    model: clip("thank-you"),
    next: "goodbye",
  },
  goodbye: {
    title: "出发吧",
    npc: "You're welcome! Have a great trip!",
    audio: clip("goodbye"),
    answer: "Bye!",
    keyword: "Bye",
    model: clip("bye"),
    next: "completed",
  },
} as const;
