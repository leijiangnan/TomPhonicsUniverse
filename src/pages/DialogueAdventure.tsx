import { Check, Volume2, RotateCcw, ArrowRight, HandHeart } from "lucide-react";
import { Robot, WordArt } from "../components/Art";
import { TemporaryRecording } from "../components/TemporaryRecording";
import {
  clip,
  shopItems,
  shopNodes,
  type ShopItem,
} from "../data/dialogues/shop";
import { type DialogueAction, type DialogueState } from "../lib/dialogue";
export function ShopItemArt({ item }: { item: ShopItem }) {
  return item === "apple" ? (
    <WordArt word="apple" />
  ) : (
    <svg
      className="word-art"
      viewBox="0 0 300 200"
      role="img"
      aria-label="能量宝石"
    >
      <path d="m95 43 110 0 44 51-99 87L51 94Z" fill="#7bcac6" />
      <path d="m95 43 26 51h58l26-51-55 15Z" fill="#c1efdf" />
      <path d="M51 94h70l29 87Zm128 0h70l-99 87Z" fill="#549cae" />
      <path d="m121 94 29 87 29-87Z" fill="#99dfd3" />
      <path d="m229 28 5 11 12 4-12 4-5 12-4-12-12-4 12-4Z" fill="#f3ce78" />
    </svg>
  );
}
export function DialogueAdventure({
  state,
  onAction,
  onPlay,
  onComplete,
}: {
  state: DialogueState;
  onAction: (a: DialogueAction) => void;
  onPlay: (src: string) => void;
  onComplete: () => void;
}) {
  const done = state.node === "completed";
  const node =
    state.node === "completed" ? shopNodes.goodbye : shopNodes[state.node];
  const item = state.item ?? "apple";
  const npc = state.node === "thanks" ? `Here is your ${item}!` : node.npc;
  const npcAudio = state.node === "thanks" ? clip(`give-${item}`) : node.audio;
  const choosing = state.node === "request";
  return (
    <main className="dialogue-page">
      <div className="activity-heading">
        <div>
          <h1>宇宙商店</h1>
          <p>{done ? "补给到手，准备出发！" : node.title}</p>
        </div>
        <span className="round-count" aria-label="对话进度">
          {done ? 4 : state.completed.length + 1} / 4
        </span>
      </div>
      {done ? (
        <section className="shop-summary" aria-label="对话回顾">
          <div className="shop-prize">
            <ShopItemArt item={item} />
            <h2>带上{shopItems[item].label}出发！</h2>
          </div>
          <div className="shop-recap">
            <h2>我们说过的话</h2>
            {[
              { text: "Hello!", audio: clip("hello") },
              { text: shopItems[item].sentence, audio: shopItems[item].audio },
              { text: "Thank you!", audio: clip("thank-you") },
              { text: "Bye!", audio: clip("bye") },
            ].map((line) => (
              <button key={line.text} onClick={() => onPlay(line.audio)}>
                <Volume2 size={21} />
                {line.text}
              </button>
            ))}
            <p>
              已收集：{state.rewards.map((i) => shopItems[i].label).join("、")}{" "}
              · 每种保留一份
            </p>
          </div>
        </section>
      ) : (
        <section className="shop-scene" aria-label="机器人补给商店">
          <div className="shop-npc">
            <div className="shop-robot">
              <Robot />
            </div>
            <button
              className="shop-bubble"
              onClick={() => onPlay(npcAudio)}
              aria-label={`店主：${npc}，点按播放`}
            >
              <Volume2 size={25} />
              <span>{npc}</span>
            </button>
          </div>
          <div className="shop-counter">
            {choosing ? (
              <div className="shop-goods">
                {(["apple", "gem"] as const).map((i) => (
                  <button
                    key={i}
                    disabled={!state.confirmed}
                    onClick={() => onAction({ type: "choose", item: i })}
                    aria-label={`选择${shopItems[i].label}`}
                  >
                    <ShopItemArt item={i} />
                    <span>
                      {shopItems[i].label}
                      {state.confirmed && <ArrowRight size={19} />}
                    </span>
                  </button>
                ))}
              </div>
            ) : state.node === "thanks" ? (
              <div className="shop-delivery">
                <ShopItemArt item={item} />
              </div>
            ) : (
              <div className="shop-supplies" aria-hidden="true">
                <ShopItemArt item="apple" />
                <ShopItemArt item="gem" />
              </div>
            )}
          </div>
          <div className="speech-support">
            <div className="hint-modes" role="group" aria-label="口语帮助">
              {(
                [
                  ["full", "跟着说"],
                  ["keyword", "关键词"],
                  ["none", "自己说"],
                ] as const
              ).map(([hint, label]) => (
                <button
                  key={hint}
                  aria-pressed={state.hint === hint}
                  onClick={() => onAction({ type: "hint", hint })}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="speech-models">
              {state.hint === "none" ? (
                <p>听听店主的话，试着回答。</p>
              ) : choosing ? (
                (["apple", "gem"] as const).map((i) => (
                  <button
                    key={i}
                    onClick={() => onPlay(shopItems[i].audio)}
                    aria-label={`示范：${shopItems[i].sentence}`}
                  >
                    <Volume2 size={20} />
                    {state.hint === "full"
                      ? shopItems[i].sentence
                      : `I want… ${shopItems[i].keyword}`}
                  </button>
                ))
              ) : (
                <button
                  onClick={() => onPlay(node.model)}
                  aria-label={`示范：${node.answer}`}
                >
                  <Volume2 size={20} />
                  {state.hint === "full" ? node.answer : node.keyword}
                </button>
              )}
            </div>
            {!state.confirmed && <TemporaryRecording key={state.node} onPlay={onPlay} />}
          </div>
        </section>
      )}
      <footer className="activity-controls shop-controls">
        {done ? (
          <>
            <button
              className="button secondary"
              onClick={() => onAction({ type: "replay" })}
            >
              <RotateCcw size={20} />
              再逛一次
            </button>
            <button className="button primary" onClick={onComplete}>
              完成对话，点亮星球 <Check size={22} />
            </button>
          </>
        ) : state.confirmed ? (
          <p className="shop-choice-prompt" role="status">
            说好啦，点选想买的补给 ↑
          </p>
        ) : (
          <>
            <button
              className="button secondary"
              onClick={() => onAction({ type: "confirm", assisted: true })}
            >
              <HandHeart size={21} />
              家长帮我说
            </button>
            <button
              className="button primary"
              onClick={() => onAction({ type: "confirm" })}
              aria-label="家长确认本轮已尝试"
            >
              说好啦，家长确认 <Check size={22} />
            </button>
          </>
        )}
      </footer>
    </main>
  );
}
