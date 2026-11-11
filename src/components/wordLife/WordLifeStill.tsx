import { WordArt } from "../Art";
import type { WordLifeWord } from "../../lib/wordLife";

function HenStill() {
  return (
    <svg className="word-art word-life-still" viewBox="0 0 300 200" role="img" aria-label="母鸡">
      <ellipse cx="150" cy="172" rx="58" ry="10" fill="#102033" opacity="0.28" />
      <path d="M92 118c8 40 28 58 58 58s52-20 58-58c-18 16-40 22-58 22s-42-8-58-22Z" fill="#f0d09a" />
      <ellipse cx="154" cy="116" rx="64" ry="46" fill="#fff3d6" />
      <ellipse cx="196" cy="78" rx="34" ry="30" fill="#fff3d6" />
      <path d="M186 52c8-18 22-16 20 2 8-16 22-12 16 6 10-8 22 0 12 12-4 2-10 4-16 2" fill="#ef7b68" />
      <ellipse cx="214" cy="84" rx="16" ry="10" fill="#f3ce78" />
      <circle cx="188" cy="74" r="6" fill="#fffef8" />
      <circle cx="208" cy="72" r="6" fill="#fffef8" />
      <circle cx="190" cy="75" r="3" fill="#2f4a3c" />
      <circle cx="210" cy="73" r="3" fill="#2f4a3c" />
      <path d="M118 108c-16 8-24 28-10 40 12-14 22-18 34-12-8-12-14-22-24-28Z" fill="#f0d09a" />
      <path d="M108 92c2-24 20-30 24-8" fill="#f3ce78" />
      <path d="M132 154c6 22 2 30-12 30M176 156c4 20 0 28-12 28" fill="none" stroke="#f3ce78" strokeWidth="7" strokeLinecap="round" />
      <path d="M108 184h30M158 186h30" fill="none" stroke="#f3ce78" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

function BugStill() {
  return (
    <svg className="word-art word-life-still" viewBox="0 0 300 200" role="img" aria-label="小虫">
      <ellipse cx="150" cy="172" rx="52" ry="10" fill="#102033" opacity="0.28" />
      <ellipse cx="150" cy="124" rx="62" ry="36" fill="#fff3d8" />
      <ellipse cx="150" cy="108" rx="64" ry="40" fill="#ef8662" />
      <circle cx="124" cy="96" r="12" fill="#fff6e4" />
      <circle cx="168" cy="86" r="11" fill="#fff6e4" />
      <circle cx="186" cy="112" r="10" fill="#fff6e4" />
      <circle cx="150" cy="132" r="28" fill="#6b4f3a" />
      <circle cx="138" cy="128" r="7" fill="#fffef8" />
      <circle cx="162" cy="128" r="7" fill="#fffef8" />
      <circle cx="140" cy="129" r="3.5" fill="#2f4a3c" />
      <circle cx="164" cy="129" r="3.5" fill="#2f4a3c" />
      <circle cx="128" cy="140" r="5" fill="#f3b6a4" />
      <circle cx="172" cy="140" r="5" fill="#f3b6a4" />
      <path d="M140 142q10 8 20 0" fill="none" stroke="#3d2c24" strokeWidth="3" strokeLinecap="round" />
      <path d="M132 112q-14-30 6-34" fill="none" stroke="#6b4f3a" strokeWidth="4" strokeLinecap="round" />
      <path d="M168 112q14-30-6-34" fill="none" stroke="#6b4f3a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="134" cy="76" r="5" fill="#f3ce78" />
      <circle cx="166" cy="76" r="5" fill="#f3ce78" />
      <path d="M98 126h-22M202 126h22M104 146h-18M196 146h18" stroke="#6b4f3a" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function AtStill() {
  return (
    <svg className="word-art word-life-still" viewBox="0 0 300 200" role="img" aria-label="在星星旁">
      <ellipse cx="150" cy="172" rx="70" ry="12" fill="#102033" opacity="0.28" />
      <path d="M78 158h70v10H78zM168 158h18v16h-18zM92 158h18v16H92z" fill="#9eb7b7" />
      <path d="M96 78h52v48H96zM100 132h22v26h-22zM124 132h20v18h-20z" fill="#e4e9df" />
      <path d="M104 86h36v22H104z" fill="#35596b" />
      <path d="M110 92h22v6H110z" fill="#8ccdb9" />
      <path d="M116 112h14v12h-14z" fill="#f3ce78" />
      <path d="M148 96h14v28h-14z" fill="#e4e9df" />
      <path d="M210 108 228 78l18 30-18 30Z" fill="#f3ce78" />
      <path d="M228 92v32M212 108h32" stroke="#fff6d2" strokeWidth="4" />
    </svg>
  );
}

/** Box and sat reuse lesson drawings. at, hen, and bug use a matching still frame. */
export function WordLifeStill({ word }: { word: WordLifeWord }) {
  if (word === "box" || word === "sat") return <WordArt word={word} />;
  if (word === "at") return <AtStill />;
  if (word === "hen") return <HenStill />;
  return <BugStill />;
}
