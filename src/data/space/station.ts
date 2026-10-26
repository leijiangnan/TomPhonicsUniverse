export const stationLines = [
  {
    npc: "Hello, explorer!",
    reply: "Hello!",
    npcAudio: "/audio/station/welcome.mp3",
    replyAudio: "/audio/shop/hello.mp3",
    title: "向机器人打招呼",
  },
  {
    npc: "Here is your fuel cell!",
    reply: "Thank you!",
    npcAudio: "/audio/station/supply.mp3",
    replyAudio: "/audio/shop/thank-you.mp3",
    title: "收好飞船补给",
  },
  {
    npc: "Have a great trip!",
    reply: "Bye!",
    npcAudio: "/audio/station/goodbye.mp3",
    replyAudio: "/audio/shop/bye.mp3",
    title: "准备下一次探索",
  },
] as const;
