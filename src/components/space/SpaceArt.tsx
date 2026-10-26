export function Ship() {
  return (
    <svg viewBox="0 0 180 150" role="img" aria-label="Tom 的飞船">
      <path d="m60 93-26 34 40-8m46-26 26 34-40-8" fill="#83bca7" />
      <path d="M90 12q-37 27-28 101h56q9-74-28-101Z" fill="#e5ecdf" />
      <path d="M90 12q-17 12-25 35h50q-8-23-25-35" fill="#efcb76" />
      <rect x="73" y="55" width="34" height="33" rx="8" fill="#4f8299" />
      <path d="M80 59v21" stroke="#b5e4d5" strokeWidth="5" />
      <path d="m75 115 15 30 15-30Z" fill="#efbe62" />
    </svg>
  );
}
export function Earth() {
  return (
    <svg viewBox="0 0 260 220" role="img" aria-label="地球">
      <defs>
        <clipPath id="earth-crop">
          <circle cx="130" cy="110" r="82" />
        </clipPath>
      </defs>
      <circle cx="130" cy="110" r="90" fill="#345673" />
      <circle cx="130" cy="110" r="82" fill="#669fbb" />
      <g clipPath="url(#earth-crop)" fill="#a0c7a0">
        <path d="M53 64h30V39h53v28h-18v25H92v22H53Zm63 43h36v20h28v28h-22v40h-26v-26h-16Zm58-58h49v38h-27v24h-26V83h-22V61Z" />
        <path d="M75 177h80v35H75Z" fill="#e6ead9" />
      </g>
    </svg>
  );
}
export function Station() {
  return (
    <svg viewBox="0 0 300 220" role="img" aria-label="方块补给空间站">
      <g stroke="#80a5ba" strokeWidth="4" fill="#365b80">
        <path d="M10 62h66v96H10zM224 62h66v96h-66z" />
        <path d="M32 62v96m22-96v96M10 94h66m-66 32h66m170-64v96m22-96v96m-44-64h66m-66 32h66" />
      </g>
      <path d="M76 99h148v22H76z" fill="#e0b96a" />
      <rect x="105" y="67" width="90" height="87" rx="8" fill="#bed6d0" />
      <path d="M125 67V37h50v30m-50 87v30h50v-30" fill="#8cb4af" />
      <rect x="119" y="85" width="62" height="42" rx="5" fill="#314e68" />
      <path d="M129 95h15v20h-15m28-20h15v20h-15" fill="#a7dec2" />
      <path d="M143 37V20h14v17" fill="#f3ce78" />
    </svg>
  );
}
export function Badge() {
  return (
    <svg viewBox="0 0 160 170" role="img" aria-label="补给先锋收藏卡">
      <path d="m45 101-10 60 45-21 45 21-10-60" fill="#6aa4ac" />
      <path
        d="m80 8 60 33v66l-60 33-60-33V41Z"
        fill="#efce7d"
        stroke="#bfa05c"
        strokeWidth="6"
      />
      <path
        d="m80 34 11 23 25 4-18 18 4 25-22-12-22 12 4-25-18-18 25-4Z"
        fill="#f8f1cd"
      />
    </svg>
  );
}

export function FrontierPlanet({ mars = false }: { mars?: boolean }) {
  return <svg viewBox="0 0 260 220" role="img" aria-label={mars ? "火星" : "月球"}>
    <circle cx="130" cy="110" r="87" fill={mars ? "#503746" : "#364459"} />
    <circle cx="130" cy="110" r="78" fill={mars ? "#d18a6b" : "#b9c6d2"} />
    <path d="M158 37a78 78 0 0 1-62 143 82 82 0 0 0 62-143" fill={mars ? "#a65c52" : "#8797ae"} />
    <g fill={mars ? "#a96355" : "#8a9bb1"}>
      <circle cx="103" cy="80" r="17" /><circle cx="151" cy="132" r="23" /><circle cx="97" cy="142" r="9" /><circle cx="156" cy="72" r="7" />
    </g>
  </svg>;
}
