import { useId } from "react";
import { Earth, Station, FrontierPlanet } from "./SpaceArt";
import type { CatalogNode } from "../../data/space/catalog";
// Original educational illustrations, not photographs or measured surface maps.
export function NodeArt({ node }: { node: CatalogNode }) {
  const uid = useId();
  const n = node.number;
  if (node.id === "earth") return <Earth />;
  if (node.id === "station") return <Station />;
  if (node.id === "moon") return <FrontierPlanet />;
  if (node.id === "mars") return <FrontierPlanet mars />;
  const star = n >= 42 && n <= 53 && n !== 43;
  const galaxy = [58,60,61,62].includes(n);
  const nebula = [54,55,57].includes(n);
  const region = [5,10,15,37,40,41].includes(n);
  const facility = [2,6,7,39].includes(n);
  const rocky = [12,13,14,17,18].includes(n);
  const colors: Record<number,string> = {8:"#e4c38c",9:"#a8a198",19:"#d9b38a",20:"#dac065",21:"#ddd1ba",22:"#aaa69a",23:"#867d70",24:"#e0c99c",25:"#e5f0f1",26:"#dba35d",27:"#c0b8a5",28:"#a6dce1",29:"#b2c6cd",30:"#4e7ee1",31:"#c8d4d4",32:"#c6b09a",33:"#a5a5a7",34:"#d8dedb",35:"#b59381",36:"#e3ded9",38:"#ac6d52",43:"#a99988"};
  const color = colors[n] ?? (star ? ([42,46,47,48,51,53].includes(n) ? "#ef916b" : [49,50,52].includes(n) ? "#d8edff" : "#ffe1a0") : "#b4b8c1");
  return <svg viewBox="0 0 260 220" role="img" aria-label={`${node.name}示意图`}>
    <defs>
      <radialGradient id={`${uid}-ball`} cx="32%" cy="25%"><stop stopColor="#fff" stopOpacity=".65"/><stop offset=".4" stopColor={color}/><stop offset="1" stopColor={color}/></radialGradient>
      <clipPath id={`${uid}-clip`}><circle cx="130" cy="110" r="69"/></clipPath>
    </defs>
    {facility ? <g>
      {n === 39 ? <><path d="M97 85l63 55M139 121l60 55M112 97L60 33" stroke="#c8d5dc" strokeWidth="5"/><ellipse cx="106" cy="84" rx="42" ry="17" transform="rotate(32 106 84)" fill="#ecdfc1"/><path d="M90 73l-5-28 34 40" fill="none" stroke="#b1bec9" strokeWidth="4"/><rect x="137" y="116" width="25" height="25" fill="#d8b45b"/></> : <>
        {n === 6 && <circle cx="186" cy="68" r="37" fill="#a5b1c0"/>}{n === 7 && <circle cx="190" cy="65" r="35" fill="#f4c267"/>}
        <path d="M25 104h210" stroke="#d9dfe3" strokeWidth="9"/>
        {[35,75,165,205].map(x=><g key={x}><rect x={x-13} y="55" width="26" height="100" fill={n === 2 ? "#ad814b" : "#456e99"} stroke="#cad5df" strokeWidth="2"/><path d={`M${x} 55v100m-13-75h26m-26 25h26m-26 25h26`} stroke="#d8bd88" opacity=".6"/></g>)}
        <rect x="109" y="77" width="40" height="66" rx="10" fill="#d6e1df"/><rect x="120" y="51" width="17" height="119" rx="5" fill="#edf1e7"/>
      </>}
    </g> : region ? <g>
      <circle cx={n === 5 ? 65 : 130} cy="110" r={n === 5 ? 28 : 17} fill={n === 5 ? "#6cabc4" : "#f2cc7d"}/>
      {n === 5 ? <><path d="M65 110h155" stroke="#9ab8ce" strokeDasharray="5 6"/><circle cx="145" cy="110" r="16" fill="#b9c3ca"/><path d="M208 98v24m-12-12h24" stroke="#f8dc91" strokeWidth="4"/><text x="202" y="89" fill="#fff" fontSize="19">L2</text></> : <>
        {[45,65,88].map(r=><ellipse key={r} cx="130" cy="110" rx={r+15} ry={n===41?r:r*.58} fill="none" stroke="#9bb6d4" strokeWidth={n===40&&r===88?4:1} strokeDasharray={n===10 ? "6 6" : undefined} opacity=".6"/>)}
        {[15,37,41].includes(n) && Array.from({length:40},(_,i)=>{const a=i*2.4;const r=60+(i%4)*9;return <circle key={i} cx={130+Math.cos(a)*(r+10)} cy={110+Math.sin(a)*r*(n===41?1:.6)} r={2+i%3} fill="#c4ccd7"/>;})}
        {n===10 && <rect x="203" y="94" width="12" height="14" fill="#eff2ed"/>}
      </>}
    </g> : galaxy || nebula || n===56 || n===59 ? <g>
      {n===59 ? <><ellipse cx="130" cy="112" rx="103" ry="26" fill="none" stroke="#db946b" strokeWidth="12" transform="rotate(-18 130 112)"/><circle cx="130" cy="105" r="44" fill="#090e1d" stroke="#f3c18a" strokeWidth="5"/></> : <>
        {(galaxy || nebula) && Array.from({length:7},(_,i)=><ellipse key={i} cx={130+Math.sin(i*2+n)*24} cy={110+Math.cos(i+n)*16} rx={galaxy?100-i*10:60+i*3} ry={galaxy?23-i*2:30+i*3} fill={nebula ? (i%2?"#8faccb":"#b684b5") : "#bac9e9"} opacity=".13" transform={`rotate(${galaxy ? -28 : i*29} 130 110)`}/>)}
        {Array.from({length:n===56?22:65},(_,i)=>{const a=i*2.4+n; const r=12+Math.sqrt(i)*10;return <circle key={i} cx={130+Math.cos(a)*r} cy={110+Math.sin(a)*r*(galaxy?.43:.85)} r={i%7===0?2.7:1.2} fill={i%3?"#d9e8ff":"#f2d7b6"}/>;})}
        {n===57 && <path d="M100 162l12-67 12 12 12-44 12 15 5 63 15-17 9 38" fill="#51465d"/>}
      </>}
    </g> : star ? <g>
      {[90,79,68].map((r,i)=><circle key={r} cx="130" cy="110" r={r} fill={color} opacity={.05+i*.04}/>)}
      <circle cx="130" cy="110" r={n===50?31:n===53?70:58} fill={`url(#${uid}-ball)`}/>
      <path d="M112 72q25-14 45 10" fill="none" stroke="#fff" opacity=".4" strokeWidth="5"/>
    </g> : n===38 ? <g fill={color}><ellipse cx="104" cy="117" rx="45" ry="37" transform="rotate(-25 104 117)"/><ellipse cx="164" cy="88" rx="33" ry="29"/><path d="M126 102l26-14" stroke="#c88c6b" strokeWidth="12"/></g> : <g>
      {n===24 && <ellipse cx="130" cy="115" rx="112" ry="30" fill="none" stroke="#d7c8a6" strokeWidth="16" transform="rotate(-22 130 115)"/>}
      {rocky ? <path d={`M76 69l42-21 47 12 27 43-15 49-48 20-48-23-17-42Z`} fill={color}/> : <ellipse cx="130" cy="110" rx={n===34?90:69} ry={n===34?47:69} fill={`url(#${uid}-ball)`}/>}
      <g clipPath={`url(#${uid}-clip)`}>
        {[8,19,24,26,28,30].includes(n) ? <>{[77,99,123,145].map((y,i)=><path key={y} d={`M55 ${y}q65 ${i%2?19:-12} 150 0`} fill="none" stroke={n===30?"#668fe6":"#ad8c6c"} strokeWidth={n===28?3:9} opacity=".4"/>)}{n===19&&<ellipse cx="156" cy="134" rx="22" ry="10" fill="#b97659"/>}</> : <>{[0,1,2,3,4].map(i=><circle key={i} cx={90+(i*29+n*7)%80} cy={67+(i*37+n*3)%88} r={6+(i*3)%12} fill="#484858" opacity=".22"/>)}{[21,25,29].includes(n)&&<path d="M80 60l35 57-14 39m23-109 15 68 41 32" fill="none" stroke="#7b8795" strokeWidth="3"/>}{n===32&&<path d="M134 99q-20-28-28-5t34 39q44-33 26-44t-32 10" fill="#e8d8bc"/>}</>}
      </g>
      {n===24&&<path d="M28 146q73 48 207-60" fill="none" stroke="#e5d3a9" strokeWidth="10"/>}
      {n===28&&<ellipse cx="130" cy="110" rx="84" ry="25" fill="none" stroke="#a6bfc8" strokeWidth="3" transform="rotate(-65 130 110)"/>}
    </g>}
  </svg>;
}
