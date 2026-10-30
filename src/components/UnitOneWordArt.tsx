import type { ReactNode } from "react";

const art: Record<string, { label: string; drawing: ReactNode }> = {
  frog: { label: "青蛙", drawing: <><circle cx="150" cy="109" r="63" fill="#8dbb7f"/><circle cx="114" cy="59" r="22" fill="#8dbb7f"/><circle cx="186" cy="59" r="22" fill="#8dbb7f"/><circle cx="114" cy="58" r="7"/><circle cx="186" cy="58" r="7"/><path d="M116 132q34 25 68 0" fill="none" stroke="#51795d" strokeWidth="6"/></> },
  web: { label: "蜘蛛网", drawing: <><path d="M150 15v170M65 100h170M90 40l120 120M210 40 90 160M150 45l39 16 16 39-16 39-39 16-39-16-16-39 16-39Z" fill="none" stroke="#739195" strokeWidth="5"/><circle cx="150" cy="100" r="12" fill="#536c70"/></> },
  wind: { label: "风", drawing: <path d="M48 69h134q35 0 35-23t-30-20M39 103h181q30 0 30 24t-30 24M58 145h86q28 0 28 22t-25 21" fill="none" stroke="#7aaeb9" strokeWidth="12" strokeLinecap="round"/> },
  window: { label: "窗户", drawing: <><rect x="69" y="28" width="162" height="148" rx="8" fill="#a5d4dc" stroke="#876b52" strokeWidth="12"/><path d="M150 28v148M69 101h162" stroke="#876b52" strokeWidth="10"/><circle cx="109" cy="65" r="16" fill="#f4d376"/></> },
  jam: { label: "果酱", drawing: <><rect x="91" y="59" width="118" height="119" rx="18" fill="#c96973"/><rect x="86" y="39" width="128" height="27" rx="5" fill="#799795"/><rect x="109" y="93" width="82" height="54" rx="8" fill="#f3e7cb"/><path d="M149 104q-25-14-19 14 5 19 19 24 14-5 19-24 6-28-19-14Z" fill="#d7837f"/></> },
  jet: { label: "喷气飞机", drawing: <path d="m36 114 87-18 35-65 22 1-13 63 74 4q19 2 22 13-4 13-23 14l-74 4 14 42-20 1-36-43-88-4Z" fill="#8eafb9" stroke="#5f8694" strokeWidth="5"/> },
  jug: { label: "水壶", drawing: <><path d="M92 60h106l-9 106H103Z" fill="#79aeb4"/><path d="M198 79h24q32 0 32 28t-58 34" fill="none" stroke="#79aeb4" strokeWidth="14"/><path d="M92 60q4-22 27-22h53q23 0 26 22Z" fill="#a9d2ce"/></> },
  van: { label: "厢式货车", drawing: <><path d="M40 74h143l50 41v47H40Z" fill="#dfba6b"/><path d="M179 86h-31v31h65Z" fill="#acd0d4"/><circle cx="82" cy="162" r="21" fill="#455365"/><circle cx="200" cy="162" r="21" fill="#455365"/></> },
  vet: { label: "兽医", drawing: <><circle cx="150" cy="76" r="42" fill="#dba77e"/><path d="M95 176q0-61 55-61t55 61Z" fill="#e9f2e6"/><path d="M150 126v37m-18-18h36" stroke="#73a48b" strokeWidth="9"/><circle cx="136" cy="73" r="5"/><circle cx="165" cy="73" r="5"/><path d="M135 92q15 10 30 0" fill="none" stroke="#795548" strokeWidth="4"/></> },
  vest: { label: "背心", drawing: <path d="m104 32 25 0 21 26 21-26h25l27 42-22 15v89H99V89L77 74Z" fill="#91b4a4" stroke="#5e8d7d" strokeWidth="6"/> },
  zip: { label: "拉链", drawing: <><rect x="111" y="25" width="78" height="151" rx="7" fill="#8ca9b7"/><path d="M150 29v117" stroke="#e9e3c8" strokeWidth="9" strokeDasharray="8 5"/><rect x="137" y="82" width="26" height="37" rx="5" fill="#d6bf80"/></> },
  zebra: { label: "斑马", drawing: <><path d="m100 162 9-92 35-35 51 31-8 96Z" fill="#e9eee4" stroke="#667b7d" strokeWidth="5"/><path d="m112 70 27 20m-32 5 26 19m-29 4 28 21m53-70-25 20m28 4-25 20m27 4-24 19" stroke="#50676b" strokeWidth="9"/><circle cx="151" cy="77" r="6"/></> },
  zoo: { label: "动物园", drawing: <><path d="M56 175V70h188v105M105 175v-70h90v70" fill="#d0e4cd" stroke="#6d947b" strokeWidth="8"/><rect x="79" y="25" width="142" height="48" rx="8" fill="#86aa88"/><text x="150" y="58" textAnchor="middle" fontSize="30" fontWeight="bold" fill="#fff">ZOO</text><path d="M125 107v68m25-68v68m25-68v68" stroke="#6d947b" strokeWidth="5"/></> },
  box: { label: "盒子", drawing: <><path d="M70 65h160v105H70Z" fill="#cda375"/><path d="m70 65 30-29h126l4 29" fill="#e0bd8b"/><path d="M150 65v105M70 65h160" stroke="#997553" strokeWidth="7"/></> },
  six: { label: "六", drawing: <><text x="150" y="160" textAnchor="middle" fontSize="150" fontWeight="bold" fill="#6d9d8b">6</text></> },
  yak: { label: "牦牛", drawing: <><path d="M100 65q-40-35-45 2m145-2q40-35 45 2" fill="none" stroke="#a38d6b" strokeWidth="12"/><path d="M89 77q4-45 61-45t61 45l15 89H74Z" fill="#816653"/><ellipse cx="150" cy="113" rx="42" ry="35" fill="#c1a487"/><circle cx="131" cy="95" r="5"/><circle cx="169" cy="95" r="5"/></> },
  yellow: { label: "黄色", drawing: <circle cx="150" cy="101" r="72" fill="#f1ce63" stroke="#d5ad48" strokeWidth="7"/> },
  "yo-yo": { label: "悠悠球", drawing: <><path d="M150 25q52 4 0 91" fill="none" stroke="#7e7461" strokeWidth="5"/><circle cx="150" cy="138" r="44" fill="#d88372" stroke="#ae655d" strokeWidth="7"/><circle cx="150" cy="138" r="13" fill="#efd29c"/></> },
  queen: { label: "女王", drawing: <><circle cx="150" cy="107" r="54" fill="#dba477"/><path d="M104 72 92 28l36 22 22-34 22 34 36-22-12 44Z" fill="#edc668" stroke="#b28a3f" strokeWidth="5"/><circle cx="130" cy="104" r="6"/><circle cx="170" cy="104" r="6"/><path d="M130 132q20 14 40 0" fill="none" stroke="#785345" strokeWidth="5"/><path d="M95 180q10-40 55-40t55 40" fill="#9b82b1"/></> },
  quilt: { label: "被子", drawing: <><rect x="63" y="44" width="174" height="126" rx="7" fill="#d7ae8a"/><path d="M121 44v126m58-126v126M63 86h174M63 128h174" stroke="#f0dbc1" strokeWidth="6"/><path d="M65 45h56v41H65Zm116 83h54v40h-54Z" fill="#87b4a2"/></> },
  quiz: { label: "小测验", drawing: <><rect x="86" y="24" width="128" height="155" rx="8" fill="#f1ebd5" stroke="#a9b8a3" strokeWidth="6"/><text x="150" y="133" textAnchor="middle" fontSize="105" fontWeight="bold" fill="#7aa6a1">?</text></> },
  fan: { label: "风扇", drawing: <><circle cx="150" cy="87" r="62" fill="#d7e9df" stroke="#608e89" strokeWidth="8"/><path d="M150 87q-46-66 6-52 29 8-6 52Zm0 0q71-40 55 12-9 25-55-12Zm0 0q-4 80-43 42-20-20 43-42Z" fill="#79b3ae"/><circle cx="150" cy="87" r="10" fill="#456e70"/><path d="M150 149v27m-41 6h82" stroke="#608e89" strokeWidth="10" strokeLinecap="round"/></> },
  fish: { label: "鱼", drawing: <><ellipse cx="142" cy="107" rx="70" ry="43" fill="#83b7c6"/><path d="m204 107 48-38v76Z" fill="#6096a8"/><circle cx="104" cy="98" r="6" fill="#304e5b"/><path d="M136 66q-17-27 20-29l20 31m-36 0q-15 38 0 77" fill="none" stroke="#6096a8" strokeWidth="8"/></> },
  fox: { label: "狐狸", drawing: <><path d="m91 86-9-60 45 27q23-8 47 0l45-27-9 60q4 73-60 91-64-18-59-91Z" fill="#d99665"/><path d="M97 115q20 10 53 47 33-37 53-47-4 48-53 62-49-14-53-62Z" fill="#f5e2bf"/><circle cx="119" cy="102" r="6"/><circle cx="181" cy="102" r="6"/><path d="m139 130 22 0-11 12Z" fill="#51453e"/></> },
  leaf: { label: "叶子", drawing: <><path d="M65 151Q72 45 230 35q-5 130-165 116Z" fill="#81b882" stroke="#528b66" strokeWidth="6"/><path d="M59 165q70-70 145-104M111 116l-3-39m45 8 39 2" fill="none" stroke="#e0eab6" strokeWidth="6" strokeLinecap="round"/></> },
  leg: { label: "腿", drawing: <><path d="M111 35h65l-2 89q0 22 19 30l26 9v18H111Z" fill="#d6a17c" stroke="#aa765d" strokeWidth="6" strokeLinejoin="round"/><path d="M111 35h65v31h-65Z" fill="#7a99ae"/><path d="M111 161h106v20H111Z" fill="#6f8290"/></> },
  lion: { label: "狮子", drawing: <><circle cx="150" cy="104" r="77" fill="#c18a4f"/><circle cx="150" cy="106" r="55" fill="#eac47e"/><circle cx="130" cy="97" r="6"/><circle cx="170" cy="97" r="6"/><path d="m139 119 22 0-11 12Zm11 12v12m0 0q-13 11-24 0m24 0q13 11 24 0" fill="none" stroke="#78553c" strokeWidth="5" strokeLinecap="round"/></> },
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
  pin: {
    label: "大头针",
    drawing: (
      <g transform="rotate(28 150 105)">
        <circle cx="106" cy="70" r="31" fill="#d77f78" />
        <path
          d="M127 91 205 169"
          stroke="#778591"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path d="m205 169 18 20-22-17Z" fill="#596875" />
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
  mug: {
    label: "马克杯",
    drawing: (
      <>
        <path d="M82 52h126v122H82Z" fill="#7aa5b0" />
        <path
          d="M208 76h26q35 0 35 36t-61 39"
          fill="none"
          stroke="#7aa5b0"
          strokeWidth="18"
        />
        <ellipse cx="145" cy="53" rx="63" ry="15" fill="#d8e6df" />
        <ellipse cx="145" cy="55" rx="48" ry="9" fill="#6f5747" />
        <path d="M105 87h35v12h-35Zm0 22h58v12h-58Z" fill="#d8e4c6" />
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
  mat: {
    label: "垫子",
    drawing: (
      <>
        <path d="M48 62h204v103H48Z" fill="#79a78d" />
        <path
          d="m48 62 28-18h204l-28 18Zm204 0 28-18v103l-28 18Z"
          fill="#577f6c"
        />
        <path
          d="M78 83h144M78 110h144M78 137h144"
          stroke="#d6d09a"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </>
    ),
  },
  rug: {
    label: "地毯",
    drawing: (
      <>
        <path d="M54 55h192v112H54Z" fill="#9a779f" />
        <path
          d="m54 55-22 15m22 9-22 15m22 9-22 15m22 9-22 15m214-87 22 15m-22 9 22 15m-22 9 22 15m-22 9 22 15"
          stroke="#cfb7d1"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="m84 83 31 31-31 31m132-62-31 31 31 31M126 78h48v72h-48Z"
          fill="none"
          stroke="#e3d29b"
          strokeWidth="8"
        />
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
