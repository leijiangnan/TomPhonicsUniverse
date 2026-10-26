import type { ReactNode } from "react";

const art: Record<string, { label: string; drawing: ReactNode }> = {
  octopus: {
    label: "章鱼",
    drawing: (
      <>
        <ellipse cx="150" cy="90" rx="55" ry="52" fill="#cf879f" />
        <circle cx="130" cy="82" r="6" />
        <circle cx="170" cy="82" r="6" />
        <path d="M142 105q8 8 16 0" fill="none" stroke="#754b66" strokeWidth="5" />
        <path d="M111 120q-45 45-57 5m78 5q-24 58-49 34m66-31v52m19-55q22 58 45 25m-24-38q48 41 55 4" fill="none" stroke="#cf879f" strokeWidth="15" strokeLinecap="round" />
      </>
    ),
  },
  ox: {
    label: "公牛",
    drawing: (
      <>
        <path d="M103 73Q60 42 67 94M197 73q43-31 36 21" fill="none" stroke="#e4d2a4" strokeWidth="15" strokeLinecap="round" />
        <rect x="92" y="61" width="116" height="105" rx="43" fill="#9d765a" />
        <ellipse cx="150" cy="132" rx="38" ry="27" fill="#d2a987" />
        <circle cx="124" cy="98" r="6" />
        <circle cx="177" cy="98" r="6" />
        <circle cx="137" cy="132" r="5" fill="#6b4d42" />
        <circle cx="163" cy="132" r="5" fill="#6b4d42" />
      </>
    ),
  },
  olive: {
    label: "橄榄",
    drawing: (
      <>
        <path d="M80 165Q150 99 222 35" fill="none" stroke="#6f7449" strokeWidth="9" />
        <g fill="#7c925b">
          <ellipse cx="110" cy="129" rx="27" ry="16" transform="rotate(25 110 129)" />
          <ellipse cx="142" cy="96" rx="27" ry="16" transform="rotate(-25 142 96)" />
          <ellipse cx="184" cy="65" rx="27" ry="16" transform="rotate(22 184 65)" />
        </g>
        <g fill="#4e603e">
          <ellipse cx="137" cy="133" rx="18" ry="26" transform="rotate(35 137 133)" />
          <ellipse cx="175" cy="101" rx="18" ry="26" transform="rotate(35 175 101)" />
          <ellipse cx="212" cy="66" rx="18" ry="26" transform="rotate(35 212 66)" />
        </g>
      </>
    ),
  },
  cat: {
    label: "小猫",
    drawing: (
      <>
        <path d="m97 76 8-45 36 32m62 13-8-45-36 32" fill="#d8a36e" />
        <rect x="92" y="55" width="116" height="112" rx="49" fill="#d8a36e" />
        <circle cx="127" cy="101" r="7" />
        <circle cx="174" cy="101" r="7" />
        <path d="m142 119 17 0-9 10ZM150 129v17m0-6q-13 12-25 0m25 0q13 12 25 0" fill="none" stroke="#6f5041" strokeWidth="5" strokeLinecap="round" />
        <path d="M104 124H61m43 14-46 10m138-24h43m-43 14 46 10" stroke="#6f5041" strokeWidth="4" />
      </>
    ),
  },
  cup: {
    label: "杯子",
    drawing: (
      <>
        <path d="M91 57h111v100H91Z" fill="#83b7bb" />
        <path d="M202 76h24q33 0 28 33t-52 27" fill="none" stroke="#83b7bb" strokeWidth="17" />
        <ellipse cx="146" cy="57" rx="56" ry="14" fill="#dbe8dc" />
        <ellipse cx="146" cy="59" rx="43" ry="9" fill="#705847" />
        <path d="M105 157h83" stroke="#557c82" strokeWidth="8" strokeLinecap="round" />
      </>
    ),
  },
  car: {
    label: "汽车",
    drawing: (
      <>
        <path d="m65 117 23-43h117l31 43v39H65Z" fill="#cf6f68" />
        <path d="m104 82-16 35h127l-25-35Z" fill="#bcd8dd" />
        <path d="M149 80v38" stroke="#6d8790" strokeWidth="5" />
        <circle cx="103" cy="157" r="22" fill="#455365" />
        <circle cx="203" cy="157" r="22" fill="#455365" />
        <circle cx="103" cy="157" r="9" fill="#aeb7b5" />
        <circle cx="203" cy="157" r="9" fill="#aeb7b5" />
      </>
    ),
  },
  key: {
    label: "钥匙",
    drawing: (
      <g transform="rotate(-35 150 105)">
        <circle cx="93" cy="105" r="38" fill="none" stroke="#e1bd65" strokeWidth="15" />
        <path d="M130 105h107m-24 0v27m-27-27v18" stroke="#e1bd65" strokeWidth="15" strokeLinecap="square" />
      </g>
    ),
  },
  kite: {
    label: "风筝",
    drawing: (
      <>
        <path d="m150 26 68 72-68 65-68-65Z" fill="#80b5b2" />
        <path d="m150 26v137M82 98h136" stroke="#e9dfbd" strokeWidth="5" />
        <path d="M150 163q28 14 4 27t12 24" fill="none" stroke="#8e7060" strokeWidth="5" />
        <path d="m147 181-20 10 12 14m19-8 20 9-12 14" fill="#d78073" />
      </>
    ),
  },
  king: {
    label: "国王",
    drawing: (
      <>
        <circle cx="150" cy="109" r="53" fill="#dba477" />
        <path d="M102 83 86 28l42 27 22-40 23 40 42-27-17 55Z" fill="#edc668" stroke="#b28a3f" strokeWidth="5" />
        <circle cx="130" cy="106" r="6" />
        <circle cx="171" cy="106" r="6" />
        <path d="M128 136q22 17 44 0" fill="none" stroke="#785345" strokeWidth="6" strokeLinecap="round" />
        <path d="m101 143 16 42h66l17-42q-50 26-99 0" fill="#8b6ea3" />
      </>
    ),
  },
  egg: {
    label: "鸡蛋",
    drawing: <path d="M150 27q54 47 54 101a54 54 0 0 1-108 0q0-54 54-101Z" fill="#f1e8c8" stroke="#c9bfa3" strokeWidth="6" />,
  },
  elephant: {
    label: "大象",
    drawing: (
      <>
        <ellipse cx="150" cy="109" rx="78" ry="61" fill="#91a8b7" />
        <circle cx="94" cy="102" r="42" fill="#a8bbc6" />
        <circle cx="206" cy="102" r="42" fill="#a8bbc6" />
        <path d="M150 112v45q0 25 25 24" fill="none" stroke="#91a8b7" strokeWidth="24" strokeLinecap="round" />
        <circle cx="128" cy="94" r="5" />
        <circle cx="172" cy="94" r="5" />
        <path d="M121 145v36m58-36v36" stroke="#708b9d" strokeWidth="14" />
      </>
    ),
  },
  elbow: {
    label: "手肘",
    drawing: (
      <>
        <path d="M74 57h92v68h63" fill="none" stroke="#d6a17c" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="168" cy="125" r="27" fill="#bd8067" opacity=".45" />
        <path d="m228 104 30 20-30 23" fill="#d6a17c" />
      </>
    ),
  },
  hat: {
    label: "帽子",
    drawing: (
      <>
        <path d="M102 127 119 45h65l17 82Z" fill="#8a759e" />
        <ellipse cx="151" cy="136" rx="91" ry="25" fill="#aa91bd" />
        <path d="M106 108h91" stroke="#e3bd68" strokeWidth="16" />
      </>
    ),
  },
  hand: {
    label: "手",
    drawing: (
      <path d="M109 177V91q0-14 13-14t13 14V43q0-14 13-14t13 14v41-50q0-13 13-13t13 13v54-38q0-13 13-13t13 13v76q0 59-58 59Z" fill="#d9a27d" stroke="#ae765f" strokeWidth="5" strokeLinejoin="round" />
    ),
  },
  horse: {
    label: "马",
    drawing: (
      <>
        <path d="m105 162 11-105 38-31 43 41-11 95Z" fill="#a57956" />
        <path d="m116 57-28-26 36 5m63 32 34-29-17 50" fill="#7b5948" />
        <path d="M112 65q48 28 79 0" fill="none" stroke="#60483e" strokeWidth="14" />
        <circle cx="151" cy="84" r="6" />
        <path d="M145 126q15 8 29 0" fill="none" stroke="#5a433c" strokeWidth="5" />
      </>
    ),
  },
  rabbit: {
    label: "兔子",
    drawing: (
      <>
        <ellipse cx="124" cy="60" rx="20" ry="49" fill="#b9b6ad" />
        <ellipse cx="177" cy="60" rx="20" ry="49" fill="#b9b6ad" />
        <circle cx="150" cy="125" r="61" fill="#c9c6bc" />
        <circle cx="127" cy="115" r="6" />
        <circle cx="174" cy="115" r="6" />
        <path d="m140 134 20 0-10 12Zm10 12v16m0-7q-13 10-24 0m24 0q13 10 24 0" fill="none" stroke="#6f6862" strokeWidth="5" />
      </>
    ),
  },
  robot: {
    label: "机器人",
    drawing: (
      <>
        <path d="M150 33V14m-18 0h36" stroke="#6f918f" strokeWidth="7" />
        <rect x="83" y="42" width="134" height="92" rx="12" fill="#9ec3be" />
        <rect x="104" y="62" width="92" height="44" rx="5" fill="#314e58" />
        <rect x="120" y="76" width="13" height="16" fill="#b2e1a9" />
        <rect x="168" y="76" width="13" height="16" fill="#b2e1a9" />
        <rect x="110" y="134" width="80" height="43" fill="#709b98" />
        <path d="M83 80H58v61m159-61h25v61M126 177v15m49-15v15" stroke="#709b98" strokeWidth="13" />
      </>
    ),
  },
  rain: {
    label: "雨",
    drawing: (
      <>
        <path d="M87 107q-3-45 42-43 18-42 58-17 31-6 39 29 37 9 22 45H87Z" fill="#9bb3c0" />
        <path d="m104 136-12 31m55-31-12 31m56-31-12 31m54-31-12 31" stroke="#5f9ab7" strokeWidth="9" strokeLinecap="round" />
      </>
    ),
  },
  ball: {
    label: "球",
    drawing: (
      <>
        <circle cx="150" cy="106" r="76" fill="#db7b6d" />
        <path d="M85 67q65 13 130-5M75 126q77-15 150 19M150 30q-31 76 5 152" fill="none" stroke="#f2d49d" strokeWidth="9" />
      </>
    ),
  },
  bed: {
    label: "床",
    drawing: (
      <>
        <rect x="54" y="86" width="192" height="71" rx="8" fill="#7ca1ad" />
        <rect x="68" y="68" width="61" height="35" rx="12" fill="#eee5c9" />
        <path d="M50 58v122m200-80v80M55 146h190" stroke="#526d78" strokeWidth="13" />
        <path d="M129 85h111v49H129Z" fill="#cfae79" />
      </>
    ),
  },
  bus: {
    label: "公交车",
    drawing: (
      <>
        <rect x="48" y="55" width="204" height="108" rx="20" fill="#e0bc61" />
        <path d="M69 74h151v47H69Z" fill="#a9c9ce" />
        <path d="M119 74v47m52-47v47" stroke="#6d8e96" strokeWidth="5" />
        <circle cx="91" cy="163" r="21" fill="#465363" />
        <circle cx="210" cy="163" r="21" fill="#465363" />
        <rect x="225" y="79" width="27" height="69" fill="#c99c46" />
      </>
    ),
  },
  goat: {
    label: "山羊",
    drawing: (
      <>
        <path d="M110 70Q70 32 79 87m111-17q40-38 31 17" fill="none" stroke="#bda77e" strokeWidth="12" />
        <rect x="96" y="58" width="108" height="104" rx="45" fill="#d4c7a5" />
        <circle cx="127" cy="100" r="6" />
        <circle cx="174" cy="100" r="6" />
        <path d="m137 125 26 0-13 13Zm13 13 0 38-20-28m20 28 20-28" fill="#8c765f" stroke="#8c765f" strokeWidth="5" />
      </>
    ),
  },
  gift: {
    label: "礼物",
    drawing: (
      <>
        <path d="M68 83h164v94H68Z" fill="#cf7977" />
        <path d="M58 63h184v36H58Z" fill="#e49a7e" />
        <path d="M136 63h28v114h-28Z" fill="#efd07b" />
        <path d="M150 63q-55-4-39-31 15-25 39 31Zm0 0q55-4 39-31-15-25-39 31Z" fill="none" stroke="#efd07b" strokeWidth="13" />
      </>
    ),
  },
  gum: {
    label: "口香糖",
    drawing: (
      <>
        <path d="M66 76h168v70H66Z" fill="#df8fa8" />
        <path d="m66 76-34 35 34 35m168-70 34 35-34 35" fill="#bd6f8d" />
        <circle cx="150" cy="111" r="25" fill="#f1c0cf" />
        <path d="M139 111h22" stroke="#a55f7a" strokeWidth="6" strokeLinecap="round" />
      </>
    ),
  },
  umbrella: {
    label: "雨伞",
    drawing: (
      <>
        <path d="M49 105a101 83 0 0 1 202 0q-25-25-50 0-25-25-51 0-25-25-51 0-25-25-50 0Z" fill="#7aa8b7" />
        <path d="M150 39v112q0 35 31 28 20-5 18-29" fill="none" stroke="#566e78" strokeWidth="9" strokeLinecap="round" />
      </>
    ),
  },
  up: {
    label: "向上",
    drawing: (
      <path d="m150 20 83 82h-49v78h-68v-78H67Z" fill="#79ad86" stroke="#4f7b60" strokeWidth="6" strokeLinejoin="round" />
    ),
  },
  uncle: {
    label: "叔叔",
    drawing: (
      <>
        <circle cx="150" cy="103" r="68" fill="#d5a27e" />
        <path d="M84 94q5-70 66-70t66 70q-31-22-66-22T84 94" fill="#5a4b48" />
        <circle cx="124" cy="107" r="7" />
        <circle cx="177" cy="107" r="7" />
        <path d="M124 139q26 18 52 0" fill="none" stroke="#795548" strokeWidth="6" strokeLinecap="round" />
        <path d="M76 190q14-43 74-43t74 43" fill="#668b91" />
      </>
    ),
  },
};

export const unitOneArtWords = Object.keys(art);

export function UnitOneWordArt({ word }: { word: string }) {
  const item = art[word];
  return item ? (
    <svg
      className="word-art"
      viewBox="0 0 300 200"
      role="img"
      aria-label={item.label}
    >
      {item.drawing}
    </svg>
  ) : null;
}
