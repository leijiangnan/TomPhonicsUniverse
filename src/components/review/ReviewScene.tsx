import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { WordArt } from "../Art";
import type {
  ReviewSceneId,
  ReviewSceneItem,
} from "../../data/reviews";

function SceneBackdrop({ sceneId }: { sceneId: ReviewSceneId }) {
  const launch = sceneId === "launch-check";
  return (
    <svg
      className="review-scene-backdrop"
      viewBox="0 0 1000 560"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <rect width="1000" height="560" fill="#182a42" />
      <path d="M0 0h1000v88H0Z" fill="#263e52" />
      <path d="M0 445h1000v115H0Z" fill="#324957" />
      <path
        d="M0 445 145 350h710l145 95"
        fill="#253b49"
        stroke="#54717c"
        strokeWidth="6"
      />
      <path
        d="M80 88v357M920 88v357M500 88v357"
        stroke="#466276"
        strokeWidth="5"
        opacity=".8"
      />
      <rect
        x="690"
        y="112"
        width="230"
        height="142"
        rx="18"
        fill="#102032"
        stroke="#79a9bb"
        strokeWidth="7"
      />
      <circle cx="838" cy="168" r="38" fill="#e9c76d" />
      <circle cx="735" cy="210" r="19" fill="#7ea9c9" />
      <path
        d="M106 128h265v126H106Zm23 22h219v82H129Z"
        fill="#314e61"
        stroke="#638493"
        strokeWidth="5"
      />
      <path
        d="M144 181h42m22 0h42m22 0h42"
        stroke={launch ? "#a6dbb6" : "#e9c76d"}
        strokeWidth="13"
        strokeLinecap="round"
      />
      <path
        d="M68 392h208l58 53H28Zm656 0h208l40 53H666Z"
        fill="#526875"
      />
      {launch ? (
        <>
          <path
            d="M432 112h136l47 84-47 84H432l-47-84Z"
            fill="#385365"
            stroke="#9fc1ca"
            strokeWidth="7"
          />
          <path
            d="m500 137 38 59-38 59-38-59Z"
            fill="#a6dbb6"
          />
          <path
            d="M414 326h172v119H414Z"
            fill="#685f75"
            stroke="#91859e"
            strokeWidth="6"
          />
        </>
      ) : (
        <>
          <path
            d="M432 112h136v168H432Z"
            fill="#4e5f6d"
            stroke="#8699a3"
            strokeWidth="7"
          />
          <path
            d="M455 142h90v53h-90Zm0 77h34v34h-34Zm56 0h34v34h-34Z"
            fill="#8db7ae"
          />
          <path
            d="M410 355h180l36 90H374Z"
            fill="#70645f"
            stroke="#9a8a7e"
            strokeWidth="6"
          />
        </>
      )}
    </svg>
  );
}

export function ReviewScene({
  sceneId,
  title,
  items,
  matchedItemIds = [],
  highlightedItemId,
  onItem,
}: {
  sceneId: ReviewSceneId;
  title: string;
  items: readonly ReviewSceneItem[];
  matchedItemIds?: readonly string[];
  highlightedItemId?: string;
  onItem: (item: ReviewSceneItem) => void;
}) {
  return (
    <section className="review-scene" aria-label={title}>
      <div className="review-scene-name">{title}</div>
      <SceneBackdrop sceneId={sceneId} />
      <div className="review-scene-items">
        {items.map((item) => {
          const matched = matchedItemIds.includes(item.id);
          const highlighted = item.id === highlightedItemId;
          const style = {
            "--item-x": `${item.x}%`,
            "--item-y": `${item.y}%`,
          } as CSSProperties;
          return (
            <button
              key={item.id}
              type="button"
              className={`review-scene-item ${item.size ?? "medium"} ${matched ? "matched" : ""} ${highlighted ? "highlighted" : ""}`}
              style={style}
              data-object-id={item.id}
              aria-label={`${item.meaning}，点击播放单词 ${item.word}${matched ? "，已归位" : ""}`}
              aria-pressed={matched}
              onClick={() => onItem(item)}
            >
              <WordArt word={item.word} />
              {matched && (
                <span className="review-object-word">
                  <Check size={16} />
                  <span>
                    <b>{item.word}</b>
                    <small>{item.meaning}</small>
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
