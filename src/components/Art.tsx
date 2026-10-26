import { NewWordArt, newArtWords } from "./NewWordArt";
import { UnitOneWordArt, unitOneArtWords } from "./UnitOneWordArt";
import { useId } from "react";
export function Cube({
  x,
  y,
  size = 60,
  top = "#91d5b0",
  left = "#4ba582",
  right = "#307e68",
}: {
  x: number;
  y: number;
  size?: number;
  top?: string;
  left?: string;
  right?: string;
}) {
  const w = size,
    h = size * 0.48;
  return (
    <g>
      <path d={`M${x},${y} l${w},-${h} ${w},${h} -${w},${h}Z`} fill={top} />
      <path d={`M${x},${y} l${w},${h} v${w} l-${w},-${h}Z`} fill={left} />
      <path
        d={`M${x + w},${y + h} l${w},-${h} v${w} l-${w},${h}Z`}
        fill={right}
      />
    </g>
  );
}
export function PlanetArt({
  kind = "forest",
}: {
  kind?: "forest" | "desert" | "ice";
}) {
  const forest = kind === "forest";
  const palette = forest
    ? ["#b0d287", "#61795f", "#405c52"]
    : kind === "desert"
      ? ["#d2af8d", "#967c78", "#71666f"]
      : ["#a5bddb", "#617c9d", "#415b80"];
  const id = useId();
  return (
    <svg viewBox="0 0 360 340" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={id}>
          <stop stopColor={forest ? "#6fcf9b" : "#a0a6d4"} stopOpacity=".18" />
          <stop offset="1" stopColor="#526e91" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="180" cy="192" rx="178" ry="145" fill={`url(#${id})`} />
      <ellipse
        cx="180"
        cy="287"
        rx="103"
        ry="17"
        fill="#070f24"
        opacity=".35"
      />
      <Cube
        x={70}
        y={139}
        size={110}
        top={palette[0]}
        left={palette[1]}
        right={palette[2]}
      />
      <path
        d="m70 139 110 53 110-53v25l-23 11v-12l-22 11v22l-22 11v-15l-22 11v17l-21 10-22-11v-18l-22-10v10l-22-11v-21l-22-10v9l-22-11Z"
        fill={forest ? "#7dbb79" : palette[0]}
        opacity=".65"
      />
      <g opacity=".34" fill={forest ? "#bfa384" : "#c5b3ba"}>
        <path d="m92 208 22 11v22l-22-11Z" />
        <path d="m136 252 22 11v22l-22-11Z" />
        <path d="m203 224 22-11v22l-22 11Z" />
        <path d="m247 224 22-11v22l-22 11Z" />
      </g>
      {forest ? (
        <>
          <path d="m132 145 10 5v-56l-10-5Z" fill="#805f45" />
          <path d="m142 94 9-4v56l-9 4Z" fill="#574b3e" />
          <Cube
            x={107}
            y={84}
            size={32}
            top="#7cbb77"
            left="#39816b"
            right="#286759"
          />
          <Cube
            x={115}
            y={58}
            size={25}
            top="#9bce84"
            left="#529b72"
            right="#398367"
          />
          <path d="m219 144 8 4v-39l-8-4Z" fill="#805f45" />
          <Cube
            x={198}
            y={92}
            size={26}
            top="#9bc685"
            left="#4c9873"
            right="#347563"
          />
          <Cube
            x={204}
            y={70}
            size={20}
            top="#b0d38a"
            left="#72ae7e"
            right="#478a6c"
          />
          <Cube
            x={168}
            y={147}
            size={15}
            top="#f6d481"
            left="#d5a44b"
            right="#9c7b3a"
          />
          <path d="M153 120h7v7h-7zM234 150h7v7h-7z" fill="#f4e7a1" />
        </>
      ) : kind === "desert" ? (
        <>
          <Cube
            x={126}
            y={98}
            size={35}
            top="#d2bf9d"
            left="#b29b85"
            right="#8b7c76"
          />
          <Cube
            x={174}
            y={123}
            size={24}
            top="#b9aa9a"
            left="#9a8c85"
            right="#79717b"
          />
        </>
      ) : (
        <>
          <path d="m115 141 35-91 29 83Z" fill="#c2d9eb" />
          <path d="m150 50 29 83 34-16Z" fill="#84a9c7" />
          <path d="m207 146 25-67 32 62Z" fill="#b1cce2" />
        </>
      )}
    </svg>
  );
}
export function Robot({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? "robot small" : "robot"}
      viewBox="0 0 130 150"
      aria-hidden="true"
    >
      <path d="M62 15V5h7v10" stroke="#8ed3b8" strokeWidth="6" />
      <path d="M48 5h34" stroke="#f0c875" strokeWidth="7" />
      <path fill="#c6dbd3" d="M25 24h81v64H25z" />
      <path fill="#8bb8b1" d="M106 24h9v64h-9zM17 43h8v26h-8z" />
      <path fill="#223e4a" d="M34 37h63v35H34z" />
      <path fill="#a6e7bd" d="M43 46h10v13H43zM78 46h10v13H78z" />
      <path
        fill="#6ea59c"
        d="M51 87h30v9H51zM39 95h54v36H39zM21 98h12v28H21zM99 98h12v28H99z"
      />
      <path fill="#d6e5d8" d="M43 95h46v25H43z" />
      <path fill="#eac371" d="M58 101h16v12H58z" />
      <path fill="#537f81" d="M43 132h16v12H36v-6h7zM74 132h16v6h7v6H74z" />
    </svg>
  );
}
export function WordArt({ word }: { word: string }) {
  if (unitOneArtWords.includes(word)) return <UnitOneWordArt word={word} />;
  if (newArtWords.includes(word)) return <NewWordArt word={word} />;
  return (
    <svg
      className="word-art"
      viewBox="0 0 300 200"
      aria-label={
        (
          {
            sun: "太阳",
            snake: "蛇",
            sock: "袜子",
            apple: "苹果",
            ant: "蚂蚁",
            alligator: "短吻鳄",
            top: "陀螺",
            tiger: "老虎",
            turtle: "海龟",
            sat: "坐下的宇航员",
          } as Record<string, string>
        )[word] ?? word
      }
      role="img"
    >
      {word === "sun" ? (
        <g>
          <g fill="#f0bb54">
            <path d="M141 12h18v25h-18zM141 163h18v25h-18zM63 91h25v18H63zM212 91h25v18h-25zM84 32h17v24H84zM201 144h17v24h-17zM201 32h17v24h-17zM84 144h17v24H84z" />
          </g>
          <path
            fill="#f6d16e"
            d="M110 52h80v16h16v65h-16v16h-80v-16H94V68h16z"
          />
          <path fill="#e9ad4d" d="M190 68h16v65h-16v16h-80v-13h67v-16h13z" />
          <path
            fill="#745641"
            d="M124 87h8v13h-8zM168 87h8v13h-8zM139 114h22v7h-22z"
          />
        </g>
      ) : word === "apple" ? (
        <g>
          <path fill="#6a9b6b" d="M151 47V24h29v14h-15v9z" />
          <path fill="#846249" d="M141 34h12v31h-12z" />
          <path
            fill="#df806d"
            d="M95 64h43v10h24V64h43v17h15v67h-15v20h-43v-9h-24v9H95v-20H80V81h15z"
          />
          <path fill="#ba605b" d="M205 81h15v67h-15v20h-43v-13h29v-20h14z" />
          <path fill="#f0ac91" d="M101 82h15v36h-15z" />
        </g>
      ) : word === "top" ? (
        <g>
          <path fill="#a7b1cd" d="M143 32h15v42h-15z" />
          <path fill="#d9c3ec" d="m150 63 76 47-76 48-76-48Z" />
          <path fill="#9b85bd" d="m74 110 76 48v25l-76-58Z" />
          <path fill="#7c6b9f" d="m150 158 76-48v15l-76 58Z" />
          <path fill="#f5d08b" d="m150 85 40 25-40 26-40-26Z" />
        </g>
      ) : word === "snake" ? (
        <g>
          <path
            d="M71 151h77V99h53V65"
            fill="none"
            stroke="#579965"
            strokeWidth="28"
            strokeLinejoin="round"
          />
          <path fill="#85bd70" d="M174 42h63v48h-63z" />
          <path fill="#294b43" d="M215 51h9v11h-9z" />
          <path
            d="M237 76h17l8-6m-8 6 8 6"
            fill="none"
            stroke="#d57568"
            strokeWidth="5"
          />
          <path
            d="M91 141v20m31-20v20m53-72v20"
            stroke="#add08a"
            strokeWidth="8"
          />
        </g>
      ) : word === "sock" ? (
        <g>
          <path fill="#f2ddae" d="M119 28h76v109l-35 35H89l-20-20v-28h50z" />
          <path
            fill="#6aa79c"
            d="M119 28h76v28h-76zM119 68h76v12h-76zM69 124h25v48h-5l-20-20zM170 113h25v24l-25 25z"
          />
        </g>
      ) : word === "ant" ? (
        <g stroke="#774e40" strokeWidth="7" strokeLinecap="round">
          <path
            d="m124 100-34-33H68m59 49-47 10-13 24m57-18-31 33h-20m91-59 24-39h20m-42 55 38 4 21 24m-60-17 19 35h24"
            fill="none"
          />
          <path d="m155 61-7-28-13-9m37 37 14-28 13-4" fill="none" />
          <rect
            x="98"
            y="117"
            width="59"
            height="47"
            rx="20"
            fill="#ae7051"
            stroke="none"
          />
          <rect
            x="127"
            y="85"
            width="40"
            height="39"
            rx="15"
            fill="#bf8059"
            stroke="none"
          />
          <rect
            x="136"
            y="47"
            width="53"
            height="45"
            rx="14"
            fill="#d79563"
            stroke="none"
          />
          <path d="M169 58v8" stroke="#344d44" />
        </g>
      ) : word === "alligator" ? (
        <g>
          <path fill="#518b62" d="m44 104 44 7 28-25h75v67H81z" />
          <path fill="#75a66b" d="M177 83h39v15h58v42h-97z" />
          <path fill="#91bd77" d="M186 69h26v29h-26z" />
          <path fill="#344d43" d="M196 77h8v10h-8z" />
          <path
            fill="#3e7455"
            d="M104 142h20v24H94v-10h10zM173 142h20v24h-30v-10h10z"
          />
          <path
            fill="#bad493"
            d="m83 110 10-24 12 15 15-29 16 14 14-18 15 18"
          />
          <path d="M212 123h60" stroke="#436b4c" strokeWidth="5" />
          <path fill="#fff5d8" d="m222 123 5 10 6-10m13 0 5 10 6-10" />
        </g>
      ) : word === "tiger" ? (
        <g>
          <path
            d="M203 131h30V88h-17"
            fill="none"
            stroke="#d69447"
            strokeWidth="16"
            strokeLinejoin="round"
          />
          <path
            fill="#e6a44e"
            d="M103 91h100v64H103zM80 37h27v27H80zM145 37h27v27h-27zM78 57h97v66H78zM104 144h23v28h-23zM174 144h23v28h-23z"
          />
          <path fill="#f2d4a0" d="M94 93h64v29H94z" />
          <path
            fill="#58483b"
            d="M95 73h10v12H95zM148 73h10v12h-10zM119 100h15v9h-15zM119 57h14v24h-14zM78 89h16v9H78zM159 89h16v9h-16zM148 123h13v19h-13zM180 101h12v27h-12z"
          />
        </g>
      ) : word === "turtle" ? (
        <g>
          <path
            fill="#8cb67d"
            d="m100 70-24-21-18 13 28 32m10 45-22 30 22 7 20-30m73-57 25-27-19-15-24 22m1 75 22 28 20-11-22-32"
          />
          <path fill="#9bc48b" d="M206 83h54v37h-54z" />
          <path fill="#304f48" d="M243 89h7v9h-7z" />
          <path fill="#5b9976" d="M94 55h91l27 27v51l-27 23H94l-24-23V82z" />
          <path fill="#a0c48d" d="m115 72 49 0 22 33-22 33h-49l-22-33z" />
          <path
            fill="none"
            stroke="#487d62"
            strokeWidth="5"
            d="m115 72-16-17m65 17 15-17m7 50h26m-48 33 16 18m-65-18-17 18m-5-51H70"
          />
        </g>
      ) : (
        <g>
          <path
            fill="#9eb7b7"
            d="M84 143h133v18H84zM189 161h17v23h-17zM92 161h17v23H92z"
          />
          <path
            fill="#e4e9df"
            d="M110 27h68v61h-68zM116 95h58v42h-58zM156 137h45v16h-45zM116 128h18v38h-18z"
          />
          <path fill="#35596b" d="M119 36h50v36h-50z" />
          <path fill="#8ccdb9" d="M124 42h36v8h-36z" />
          <path fill="#deb765" d="M132 103h20v18h-20z" />
        </g>
      )}
    </svg>
  );
}
