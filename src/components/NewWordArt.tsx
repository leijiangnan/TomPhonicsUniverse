import type { ReactNode } from "react";
const drawings: Record<string, { label: string; art: ReactNode }> = {
  pig: {
    label: "小猪",
    art: (
      <>
        <ellipse cx="145" cy="110" rx="67" ry="50" fill="#eea7b6" />
        <path d="m95 79-8-40 41 28m38 0 38-28-5 44" fill="#eea7b6" />
        <ellipse cx="145" cy="126" rx="30" ry="21" fill="#d87a95" />
        <circle cx="135" cy="125" r="5" />
        <circle cx="155" cy="125" r="5" />
        <circle cx="119" cy="98" r="5" />
        <circle cx="174" cy="98" r="5" />
      </>
    ),
  },
  pen: {
    label: "钢笔",
    art: (
      <g transform="rotate(35 150 100)">
        <rect x="134" y="30" width="32" height="115" rx="7" fill="#518bb5" />
        <path d="m134 145 16 31 16-31" fill="#edca71" />
        <path d="m150 164 0 10M141 48v35" stroke="#24394c" strokeWidth="5" />
        <rect x="131" y="136" width="38" height="11" fill="#edca71" />
      </g>
    ),
  },
  pan: {
    label: "平底锅",
    art: (
      <>
        <path
          d="M181 111h85"
          stroke="#47546b"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <ellipse cx="117" cy="117" rx="75" ry="47" fill="#47546b" />
        <ellipse cx="117" cy="106" rx="66" ry="34" fill="#8495a6" />
        <path
          d="M91 49q-15-16 0-30m32 30q-15-16 0-30"
          stroke="#b0bfbd"
          strokeWidth="7"
          fill="none"
        />
      </>
    ),
  },
  ink: {
    label: "墨水",
    art: (
      <>
        <rect x="98" y="69" width="104" height="102" rx="18" fill="#567898" />
        <rect x="120" y="43" width="60" height="32" rx="5" fill="#293f5c" />
        <rect x="115" y="100" width="70" height="48" rx="7" fill="#e7e9d7" />
        <path d="M150 106q-32 36 0 34 32 2 0-34" fill="#334f77" />
      </>
    ),
  },
  insect: {
    label: "昆虫",
    art: (
      <>
        <path
          d="m116 85-31-24m28 51-34 4m39 25-25 24m91-80 31-24m-28 51 34 4m-39 25 25 24"
          fill="none"
          stroke="#456455"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <ellipse cx="150" cy="116" rx="44" ry="53" fill="#86b987" />
        <path d="M150 72v90" stroke="#456455" strokeWidth="5" />
        <circle cx="150" cy="58" r="23" fill="#456455" />
        <path d="m140 40-12-18m32 18 12-18" stroke="#456455" strokeWidth="5" />
        <circle cx="141" cy="55" r="4" fill="white" />
        <circle cx="160" cy="55" r="4" fill="white" />
      </>
    ),
  },
  igloo: {
    label: "冰屋",
    art: (
      <>
        <path
          d="M52 160a98 98 0 0 1 196 0Z"
          fill="#b8dce2"
          stroke="#76b1c0"
          strokeWidth="5"
        />
        <path
          d="M61 120h178M84 83h132M150 62v21m-40 0v37m80-37v37m-40 0v40m-60-40v40m120-40v40"
          stroke="#76b1c0"
          strokeWidth="4"
        />
        <path
          d="M118 164v-29a32 32 0 0 1 64 0v29"
          fill="#355b73"
          stroke="#e6f2ef"
          strokeWidth="13"
        />
      </>
    ),
  },
  net: {
    label: "网",
    art: (
      <g transform="rotate(-25 150 100)">
        <path
          d="M150 121v65"
          stroke="#a5744f"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <ellipse
          cx="150"
          cy="77"
          rx="52"
          ry="55"
          fill="#e1e8d5"
          stroke="#6e9e8e"
          strokeWidth="9"
        />
        <path
          d="M118 38v79m21-91v103m22-103v103m21-91v79M101 59h98m-101 24h104m-94 24h84"
          stroke="#82ab9c"
          strokeWidth="3"
        />
      </g>
    ),
  },
  nest: {
    label: "鸟巢",
    art: (
      <>
        <path d="M67 105q83-24 166 0l-25 53q-58 32-116 0Z" fill="#ac7950" />
        <ellipse cx="150" cy="106" rx="82" ry="28" fill="#795740" />
        <ellipse cx="122" cy="91" rx="20" ry="30" fill="#dce7cb" />
        <ellipse cx="174" cy="91" rx="20" ry="30" fill="#e8e0b9" />
        <path
          d="m76 119 132 26m-119 9 134-35M104 169l91-11"
          stroke="#d0a36b"
          strokeWidth="7"
        />
      </>
    ),
  },
  nut: {
    label: "坚果",
    art: (
      <>
        <path d="M105 83h90v41q0 34-45 54-45-20-45-54Z" fill="#c18e52" />
        <path d="M98 89q0-40 52-40t52 40v14H98Z" fill="#77573b" />
        <path
          d="M150 49q-5-24 17-27"
          stroke="#77573b"
          strokeWidth="10"
          fill="none"
        />
        <path
          d="M129 115v27"
          stroke="#e5b778"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </>
    ),
  },
  map: {
    label: "地图",
    art: (
      <>
        <path
          d="m57 49 62-17 65 18 59-17v129l-59 17-65-18-62 17Z"
          fill="#ead5a2"
          stroke="#b99967"
          strokeWidth="4"
        />
        <path d="M119 32v129m65-111v129" stroke="#c8b27e" strokeWidth="4" />
        <path
          d="M80 135q23-63 72-28t58-36"
          fill="none"
          stroke="#658d7d"
          strokeWidth="6"
          strokeDasharray="10 8"
        />
        <path d="m198 62 23 22m0-22-23 22" stroke="#bc6d57" strokeWidth="8" />
      </>
    ),
  },
  moon: {
    label: "月亮",
    art: (
      <>
        <path
          d="M187 27a75 75 0 1 0 25 128A74 74 0 0 1 187 27Z"
          fill="#edce7e"
        />
        <path
          d="m222 40 5 12 13 1-10 9 3 13-11-7-12 7 4-13-11-9 14-1Z"
          fill="#edce7e"
        />
      </>
    ),
  },
  mouse: {
    label: "老鼠",
    art: (
      <>
        <path
          d="M204 133q72-67 64 4"
          fill="none"
          stroke="#d19eaa"
          strokeWidth="8"
        />
        <ellipse cx="159" cy="127" rx="67" ry="40" fill="#9ca8b6" />
        <circle cx="100" cy="95" r="33" fill="#9ca8b6" />
        <circle cx="101" cy="91" r="20" fill="#e2b2bd" />
        <path d="M109 110q-42 0-52 42l81 8Z" fill="#9ca8b6" />
        <circle cx="86" cy="136" r="5" />
        <circle cx="57" cy="150" r="7" fill="#d08d9d" />
        <path d="m62 148-26-9m27 17-27 7" stroke="#556577" strokeWidth="3" />
      </>
    ),
  },
  dog: {
    label: "小狗",
    art: (
      <>
        <path
          d="M102 54q-40-16-39 57t45 13m90-70q40-16 39 57t-45 13"
          fill="#90654b"
        />
        <rect x="94" y="52" width="112" height="115" rx="44" fill="#d4a775" />
        <ellipse cx="150" cy="136" rx="32" ry="24" fill="#f0dbb1" />
        <circle cx="124" cy="103" r="6" />
        <circle cx="177" cy="103" r="6" />
        <path d="m138 124 24 0-12 15Z" />
        <path d="M150 140v16" stroke="#594b41" strokeWidth="4" />
      </>
    ),
  },
  duck: {
    label: "鸭子",
    art: (
      <>
        <ellipse cx="146" cy="132" rx="69" ry="41" fill="#edce78" />
        <circle cx="178" cy="71" r="35" fill="#edce78" />
        <path d="m207 66 37 10-37 15" fill="#da9357" />
        <circle cx="186" cy="64" r="5" />
        <path
          d="M112 119q18 42 53 8"
          fill="none"
          stroke="#d3ad54"
          strokeWidth="7"
        />
        <path d="m80 134-30-36 47 15" fill="#edce78" />
      </>
    ),
  },
  dinosaur: {
    label: "恐龙",
    art: (
      <>
        <path
          d="M74 141 38 110l16 44h59v24h26v-21h29v21h25v-51l20-27h29V66h-64l-17 48H98Z"
          fill="#88b594"
        />
        <path d="m93 125 13-28 18 21 15-28 17 23" fill="#d9bd71" />
        <circle cx="220" cy="79" r="5" />
        <path d="M223 98h19" stroke="#446a56" strokeWidth="4" />
      </>
    ),
  },
};
export function NewWordArt({ word }: { word: string }) {
  const item = drawings[word];
  return item ? (
    <svg
      className="word-art"
      viewBox="0 0 300 200"
      role="img"
      aria-label={item.label}
      fill="#334b52"
    >
      {item.art}
    </svg>
  ) : null;
}
export const newArtWords = Object.keys(drawings);
